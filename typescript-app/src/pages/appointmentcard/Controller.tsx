import { Fragment, useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import SubHeader from "../../components/layout/SubHeader";
import AppointmentForm, { MultiPetAppointmentData, AppointmentData } from "./AppointmentForm";
import { defaultState, navButtons, modelConfig, path, useLocalValidation, optionState, optionEndPoints } from "./PageSettings";
import useModel, { useSelectOption } from "../../lib/use-model";
import { cardDataReducer, simpleDataReducer } from "../../lib/functions";
import { useInitializeData, useDataById, useCardFormSubmitHandler } from "../../lib/use-datatool";
import AuthorizationAlert from "../authorization/AuthorizationAlert";

const Controller = () => {
  const navigate = useNavigate();
  const { mode = "create" } = useParams<{ mode?: "create" | "update" }>();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  // State for multi-pet appointments
  const [multiPetData, setMultiPetData] = useState<MultiPetAppointmentData>({
    appointments: [],
    totalamount: 0,
  });

  const [appointment, appointmentModel, appointmentStatus] = useModel(path, defaultState, modelConfig, cardDataReducer);
  const [timeSchedule, getTimeSchedule] = useSelectOption(path, optionState, optionEndPoints.timeschedule, simpleDataReducer);
  const [serviceCatType, getServiceCatType] = useSelectOption(path, optionState, optionEndPoints.servicecategory, simpleDataReducer);
  const [size, getSize] = useSelectOption(path, optionState, optionEndPoints.size, simpleDataReducer);
  const [type, getType] = useSelectOption(path, optionState, optionEndPoints.type, simpleDataReducer);

  useInitializeData({
    functionName: getType,
    args: "type",
  });

  useInitializeData({
    functionName: getSize,
    args: "size",
  });

  useInitializeData({
    functionName: getServiceCatType,
    args: "servicecategory",
  });

  useInitializeData({
    functionName: getTimeSchedule,
    args: "timeschedule",
  });

  const getappointmentById = useDataById({
    callbackFunction: appointmentModel.get,
    id: Number(id),
    options: {
      action: "read",
      preventZeroValue: true,
    },
  });

  useInitializeData({
    functionName: getappointmentById,
    args: mode === "update" && id ? Number(id) : undefined,
  });

  // Move the submit handler to component level
  const cardSubmitHandler = useCardFormSubmitHandler({
    validateFn: useLocalValidation,
    data: {
      ...appointment.data,
      id: mode === "update" ? Number(id) : undefined,
    },
    model: appointmentModel,
    mode,
    options: {
      dispatchRequest: true,
      onSuccess: () => {
        // This will be handled in the custom submit logic
      },
    },
  });

  // Initialize multi-pet data when component mounts or when updating
  useEffect(() => {
    if (mode === "create") {
      // Initialize with one empty appointment for create mode
      const initialAppointment: AppointmentData = {
        petname: "",
        servicecategoryid: 0,
        typeid: 0,
        sizeid: 0,
        durationid: 0,
        appointmentdate: "",
        timeid: 0,
        additionalserviceid: 0,
        price: 0,
      };

      setMultiPetData({
        appointments: [initialAppointment],
        totalamount: 0,
      });
    } else if (mode === "update" && appointment.data) {
      const singleAppointment: AppointmentData = {
        id: appointment.data.id,
        petname: appointment.data.petname || "",
        servicecategoryid: appointment.data.servicecategoryid || 0,
        typeid: appointment.data.typeid || 0,
        sizeid: appointment.data.sizeid || 0,
        durationid: appointment.data.durationid || 0,
        appointmentdate: appointment.data.appointmentdate || "",
        timeid: appointment.data.timeid || 0,
        additionalserviceid: appointment.data.additionalserviceid || 0,
        price: appointment.data.price || 0,
      };

      setMultiPetData({
        appointments: [singleAppointment],
        totalamount: singleAppointment.price || 0,
      });
    }
  }, [mode, appointment.data]);

  const handleMultiPetChange = (data: MultiPetAppointmentData) => {
    setMultiPetData(data);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = async () => {
    const appointmentCount = multiPetData.appointments.length;
    const confirmMessage = appointmentCount === 1 ? "Are you sure you want to submit this appointment?" : `Are you sure you want to submit these ${appointmentCount} appointments?`;

    const proceed = window.confirm(confirmMessage);
    if (!proceed) return;

    try {
      if (mode === "create") {
        // Handle multiple appointments creation
        await handleCreateMultipleAppointments();
      } else if (mode === "update") {
        // Handle single appointment update (assuming update mode only handles one appointment)
        await handleUpdateSingleAppointment();
      }
    } catch (error) {
      console.error("Error submitting appointments:", error);
      alert("An error occurred while submitting the appointments. Please try again.");
    }
  };

  const handleCreateMultipleAppointments = async () => {
    try {
      // Send all pets in one API call
      const payload = {
        appointments: multiPetData.appointments.map((appt) => ({
          ...appt,
          totalamount: appt.price || 0,
        })),
      };

      // Single API call for all pets
      await appointmentModel.post({ requestData: payload }, { dispatchRequest: true });

      navigate("/appointments", {
        state: {
          showAlert: true,
          alertMessage: {
            severity: "success",
            title: "Success",
            message: `${multiPetData.appointments.length} appointment${multiPetData.appointments.length > 1 ? "s" : ""} created successfully!`,
          },
        },
      });
    } catch (error) {
      console.error("Failed to create appointments:", error);
      alert("Failed to create appointments. Please check the form and try again.");
    }
  };

  const handleUpdateSingleAppointment = async () => {
    if (multiPetData.appointments.length !== 1) {
      alert("Update mode only supports single appointment editing.");
      return;
    }

    const appointmentData = multiPetData.appointments[0];
    const validationErrors = validateSingleAppointment(appointmentData);

    if (Object.keys(validationErrors).length > 0) {
      alert("Please fix the validation errors before submitting.");
      return;
    }

    try {
      // Create complete appointment data including totalamount
      const completeAppointmentData = {
        ...appointmentData,
        id: Number(id),
        totalamount: appointmentData.price || 0, // Add totalamount field
      };

      // Update the model state
      appointmentModel.dataDispatch({
        type: "setState",
        response: completeAppointmentData,
      });

      // Use the existing cardSubmitHandler which is properly initialized
      await cardSubmitHandler();

      navigate("/appointments", {
        state: {
          showAlert: true,
          alertMessage: {
            severity: "success",
            title: "Success",
            message: "Appointment updated successfully!",
          },
        },
      });
    } catch (error) {
      console.error("Failed to update appointment:", error);
      alert("Failed to update appointment. Please try again.");
    }
  };

  // Simple validation function for a single appointment
  const validateSingleAppointment = (appointmentData: AppointmentData) => {
    const errors: { [key: string]: string } = {};

    if (!appointmentData.petname?.trim()) {
      errors.petname = "Pet name is required";
    }
    if (!appointmentData.servicecategoryid) {
      errors.servicecategoryid = "Service category is required";
    }
    if (!appointmentData.appointmentdate) {
      errors.appointmentdate = "Appointment Date is required";
    }
    if (!appointmentData.timeid) {
      errors.timeid = "Time is required";
    }

    // Add more validation as needed based on your business rules

    return errors;
  };

  return (
    <Fragment>
      <SubHeader title="Form" buttons={navButtons} actions={{ btnBack: handleBack }} />
      <AuthorizationAlert />
      <AppointmentForm
        data={multiPetData}
        onChange={handleMultiPetChange}
        onSubmit={handleSubmit}
        selectOptions={{
          timeschedules: timeSchedule.data,
          servicecattype: serviceCatType.data,
          size: size.data,
          type: type.data,
          duration: type.data,
        }}
      />
    </Fragment>
  );
};

export default Controller;
