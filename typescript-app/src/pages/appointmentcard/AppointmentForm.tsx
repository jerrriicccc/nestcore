import { useState, useEffect } from "react";
import { Button, Form, Row, Col, Card } from "react-bootstrap";
import { BookingCalendar, DateInput, SelectInput, TextInput } from "../../components/form/Input";
import { useParams } from "react-router-dom";
import { readData } from "../../lib/crud";

export interface AppointmentData {
  id?: number;
  petname: string;
  servicecategoryid: number;
  typeid: number;
  sizeid: number;
  durationid: number;
  appointmentdate: string;
  timeid: number | null; // allow unselect
  additionalserviceid?: number;
  price?: number;
}

export interface MultiPetAppointmentData {
  appointments: AppointmentData[];
  totalamount: number;
}

type InputType = {
  name: string;
  value: string | number | (string | number)[];
  inputType: "select-single" | "select-multi";
  appointmentIndex?: number;
};

const fieldLabels = {
  petname: "Pet Name",
  servicecategoryid: "Service Category",
  typeid: "Type",
  sizeid: "Size",
  durationid: "Duration",
  appointmentdate: "Date",
  timeid: "Time",
  additionalserviceid: "Additional Service",
};

interface AppointmentFormProps {
  data: MultiPetAppointmentData;
  onChange: (data: MultiPetAppointmentData) => void;
  onSubmit: () => void;
  selectOptions: {
    timeschedules: any[];
    servicecattype: any[];
    size: any[];
    type: any[];
    duration: any[];
  };
}

const AppointmentForm = ({ data, onChange, onSubmit, selectOptions }: AppointmentFormProps) => {
  const [errors, setErrors] = useState<{ [key: string]: { [key: string]: string } }>({});
  const [isLoadingPrice, setIsLoadingPrice] = useState<{ [key: number]: boolean }>({});
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<{ [key: number]: any[] }>({});
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState<{ [key: number]: boolean }>({});
  const { mode } = useParams();

  // Initialize with at least one appointment if empty
  useEffect(() => {
    if (data.appointments.length === 0) {
      const initialAppointment: AppointmentData = {
        petname: "",
        servicecategoryid: 0,
        typeid: 0,
        sizeid: 0,
        durationid: 0,
        appointmentdate: "",
        timeid: null, // was 0
        additionalserviceid: 0,
        price: 0,
      };
      onChange({
        appointments: [initialAppointment],
        totalamount: 0,
      });
    }
  }, []);

  // Calculate total price whenever appointments change
  useEffect(() => {
    const total = data.appointments.reduce((sum, appointment) => sum + (appointment.price || 0), 0);
    if (total !== data.totalamount) {
      onChange({
        ...data,
        totalamount: total,
      });
    }
  }, [data.appointments]);

  // Fetch available time slots when date is selected
  const fetchAvailableTimeSlots = async (appointmentIndex: number, appointmentdate: string) => {
    if (!appointmentdate) return;

    setIsLoadingTimeSlots((prev) => ({ ...prev, [appointmentIndex]: true }));
    try {
      const response = await readData("/appointments/available-slots", {
        requestData: { appointmentdate },
      });

      // Get booked time slot IDs from the correct response structure
      const bookedTimeIds = response?.data || [];

      // Filter out booked time slots and get available ones
      const availableSlots = selectOptions.timeschedules.filter((timeSlot) => !bookedTimeIds.includes(Number(timeSlot.value)));

      setAvailableTimeSlots((prev) => ({
        ...prev,
        [appointmentIndex]: availableSlots,
      }));
    } catch (error) {
      console.error("Error fetching available time slots:", error);
      // Fallback to all time slots if API fails
      setAvailableTimeSlots((prev) => ({
        ...prev,
        [appointmentIndex]: selectOptions.timeschedules,
      }));
    } finally {
      setIsLoadingTimeSlots((prev) => ({ ...prev, [appointmentIndex]: false }));
    }
  };

  const handleAppointmentChange = (appointmentIndex: number, field: string, value: any) => {
    const updatedAppointments = [...data.appointments];
    updatedAppointments[appointmentIndex] = {
      ...updatedAppointments[appointmentIndex],
      [field]: value,
    };

    // If date is changed, fetch available time slots and reset selected time
    if (field === "appointmentdate") {
      fetchAvailableTimeSlots(appointmentIndex, value);
      updatedAppointments[appointmentIndex].timeid = null; // reset on date change
    }

    onChange({
      ...data,
      appointments: updatedAppointments,
    });
  };

  const addAppointment = () => {
    const newAppointment: AppointmentData = {
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

    onChange({
      ...data,
      appointments: [...data.appointments, newAppointment],
    });
  };

  const removeAppointment = (index: number) => {
    if (data.appointments.length > 1) {
      const updatedAppointments = data.appointments.filter((_, i) => i !== index);
      // Clean up state for removed appointment
      setAvailableTimeSlots((prev) => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
      setIsLoadingTimeSlots((prev) => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
      onChange({
        ...data,
        appointments: updatedAppointments,
      });
    }
  };

  // Check if service category is "Groom Service"
  const isGroomService = (appointment: AppointmentData) => {
    if (!appointment.servicecategoryid) return false;

    const categories = Array.isArray(selectOptions?.servicecattype) ? selectOptions.servicecattype : [];
    const selectedCategory = categories.find((cat) => cat.value === appointment.servicecategoryid);
    return selectedCategory?.label === "Groom Service";
  };

  // Check if service category is "Daycare Service"
  const isDaycareService = (appointment: AppointmentData) => {
    if (!appointment.servicecategoryid) return false;

    const categories = Array.isArray(selectOptions?.servicecattype) ? selectOptions.servicecattype : [];
    const selectedCategory = categories.find((cat) => cat.value === appointment.servicecategoryid);
    return selectedCategory?.label === "Daycare Service";
  };

  const validateForm = () => {
    const newErrors: { [key: string]: { [key: string]: string } } = {};

    data.appointments.forEach((appointment, index) => {
      const appointmentErrors: { [key: string]: string } = {};

      // Always validate these fields
      const requiredFields = ["petname", "servicecategoryid", "appointmentdate", "timeid"];

      // Only validate sizeid and typeid if service category is "Groom Service"
      if (isGroomService(appointment)) {
        requiredFields.push("typeid", "sizeid");
      }

      // Only validate sizeid and durationid if service category is "Daycare Service"
      if (isDaycareService(appointment)) {
        requiredFields.push("durationid", "sizeid");
      }

      requiredFields.forEach((field) => {
        if (!appointment[field as keyof AppointmentData]) {
          appointmentErrors[field] = `${fieldLabels[field as keyof typeof fieldLabels]} Required`;
        }
      });

      if (Object.keys(appointmentErrors).length > 0) {
        newErrors[index.toString()] = appointmentErrors;
      }
    });

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit();
  };

  // Get duration options for Daycare Service
  const getDurationOptions = () => {
    return (
      selectOptions?.duration || [
        { value: 1, label: "3 Hours" },
        { value: 2, label: "6 Hours" },
        { value: 3, label: "9 Hours" },
      ]
    );
  };

  // Get type options based on selected service category
  const getTypeOptions = (appointment: AppointmentData) => {
    if (!appointment.servicecategoryid) return [];

    const categories = Array.isArray(selectOptions?.servicecattype) ? selectOptions.servicecattype : [];
    const selectedCategory = categories.find((cat) => cat.value === appointment.servicecategoryid);
    if (!selectedCategory) return [];

    const allTypes = Array.isArray(selectOptions?.type) ? selectOptions.type : [];

    let filteredTypes: any[] = [];

    switch (selectedCategory.label) {
      case "Groom Service":
        filteredTypes = allTypes.filter((t) => [1, 2, 11, 12].includes(t.value));
        break;
      case "Daycare Service":
        filteredTypes = allTypes.filter((t) => [11, 12].includes(t.value));
        break;
      default:
        filteredTypes = [];
    }

    // Additional filter for Groom Service only
    if (selectedCategory.label === "Groom Service") {
      if (appointment.sizeid === 11) {
        filteredTypes = filteredTypes.filter((t) => [11, 12].includes(t.value));
      }
      if ([1, 3, 5, 7, 9].includes(appointment.sizeid)) {
        filteredTypes = filteredTypes.filter((t) => [1, 2].includes(t.value));
      }
    }

    return filteredTypes;
  };

  // Get available time slots for a specific appointment
  const getAvailableTimeSlots = (appointmentIndex: number) => {
    return availableTimeSlots[appointmentIndex] || [];
  };

  // Get price based on size and duration for Daycare Service
  const getDaycarePrice = (sizeId: number, durationId: number) => {
    const durationMap: { [key: number]: string } = {
      1: "threehrs",
      2: "sixhrs",
      3: "ninehrs",
    };

    const pricingTable = {
      "1": { threehrs: 175, sixhrs: 295, ninehrs: 445 }, // Small
      "2": { threehrs: 195, sixhrs: 325, ninehrs: 495 }, // Medium
      "3": { threehrs: 245, sixhrs: 355, ninehrs: 535 }, // Large
      "4": { threehrs: 295, sixhrs: 425, ninehrs: 595 }, // XL
      "5": { threehrs: 325, sixhrs: 495, ninehrs: 655 }, // XXL
      "6": { threehrs: 175, sixhrs: 295, ninehrs: 445 }, // Cats
    };

    const sizeKey = String(sizeId);
    const durationKey = durationMap[durationId];

    if (pricingTable[sizeKey as keyof typeof pricingTable] && durationKey) {
      return pricingTable[sizeKey as keyof typeof pricingTable][durationKey as keyof (typeof pricingTable)["1"]];
    }
    return null;
  };

  // Fetch price from API based on size and type (IDs -> labels)
  const fetchPrice = async (appointmentIndex: number, appointment: AppointmentData, sizeId: number, typeOrDurationId: number) => {
    // For Daycare Service, use local pricing table with duration
    if (isDaycareService(appointment)) {
      const price = getDaycarePrice(sizeId, typeOrDurationId);
      return price;
    }

    // For Groom Service, fetch from API with type
    const sizes = Array.isArray(selectOptions?.size) ? selectOptions.size : [];
    const types = Array.isArray(selectOptions?.type) ? selectOptions.type : [];

    const sizeLabel = sizes.find((o: any) => o.value === sizeId)?.label;
    const typeLabel = types.find((o: any) => o.value === typeOrDurationId)?.label;

    if (!sizeLabel || !typeLabel) return null;

    setIsLoadingPrice((prev) => ({ ...prev, [appointmentIndex]: true }));
    try {
      const response = await readData("/appointments/getoption/price", {
        requestData: { size: sizeLabel, type: typeLabel },
      });
      return response?.price ?? null;
    } catch (error) {
      console.error("Error fetching price:", error);
      return null;
    } finally {
      setIsLoadingPrice((prev) => ({ ...prev, [appointmentIndex]: false }));
    }
  };

  // Helper function to clear multiple fields for a specific appointment
  const clearAppointmentFields = (appointmentIndex: number, fieldNames: string[]) => {
    fieldNames.forEach((fieldName) => {
      handleAppointmentChange(appointmentIndex, fieldName, fieldName === "additionalserviceid" ? 0 : "");
    });
  };

  // Handle field changes with proper type conversion
  const handleFieldChange = (appointmentIndex: number, e: React.ChangeEvent<HTMLInputElement> | InputType) => {
    let name: string;
    let value: any;

    if ("target" in e) {
      name = e.target.name;
      value = e.target.value;
    } else {
      name = e.name;
      value = e.value;
    }

    // Convert to number for numeric fields
    if (["servicecategoryid", "typeid", "sizeid", "durationid", "timeid", "additionalserviceid", "price"].includes(name)) {
      value = value === "" ? null : Number(value); // timeid can be null
    }

    handleAppointmentChange(appointmentIndex, name, value);
  };

  // Effect to clear dependent fields when service category changes
  useEffect(() => {
    data.appointments.forEach((appointment, index) => {
      // This will trigger when servicecategoryid changes
      if (appointment.servicecategoryid) {
        clearAppointmentFields(index, ["typeid", "sizeid", "durationid", "price"]);
      }
    });
  }, [data.appointments.map((a) => a.servicecategoryid).join(",")]);

  // Effect to update price when required fields are filled
  useEffect(() => {
    data.appointments.forEach(async (appointment, index) => {
      if (appointment.sizeid && (isGroomService(appointment) || isDaycareService(appointment))) {
        if (isGroomService(appointment) && appointment.typeid) {
          const price = await fetchPrice(index, appointment, appointment.sizeid, appointment.typeid);
          handleAppointmentChange(index, "price", price ?? 0);
        } else if (isDaycareService(appointment) && appointment.durationid) {
          const price = await fetchPrice(index, appointment, appointment.sizeid, appointment.durationid);
          handleAppointmentChange(index, "price", price ?? 0);
        }
      }
    });
  }, [data.appointments.map((a) => `${a.typeid}-${a.sizeid}-${a.durationid}`).join(",")]);

  // toggle select/unselect from calendar
  const handleTimeSelectFromCalendar = (appointmentIndex: number, timeId: number | null) => {
    const updatedAppointments = [...data.appointments];
    updatedAppointments[appointmentIndex] = {
      ...updatedAppointments[appointmentIndex],
      timeid: timeId,
    };
    onChange({ ...data, appointments: updatedAppointments });
  };

  return (
    <Form onSubmit={handleSubmit} className="card shadow-sm mb-2 mx-4">
      <div className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0">
            Book Appointments ({data.appointments.length} Pet{data.appointments.length > 1 ? "s" : ""})
          </h5>
          <Button variant="outline-primary" onClick={addAppointment} size="sm">
            + Add Another Pet
          </Button>
        </div>

        {data.appointments.map((appointment, index) => (
          <Card key={index} className="mb-4 border-light">
            <Card.Header className="bg-light d-flex justify-content-between align-items-center py-2">
              <small className="text-muted fw-bold">Pet #{index + 1}</small>
              {data.appointments.length > 1 && (
                <Button variant="outline-danger" size="sm" onClick={() => removeAppointment(index)} className="btn-sm">
                  Remove
                </Button>
              )}
            </Card.Header>
            <Card.Body className="p-3">
              <div className="alert alert-info small mb-3">
                <strong>Note:</strong> Date: {appointment.appointmentdate || "None"}, Available slots: {getAvailableTimeSlots(index).length}
              </div>

              <Row className="mb-3">
                <Col xs={12}>
                  <BookingCalendar
                    bookedDates={bookedDates}
                    onSelectDate={(appointmentdate: string) => handleFieldChange(index, { name: "appointmentdate", value: appointmentdate, inputType: "select-single" })}
                    availableTimeSlots={getAvailableTimeSlots(index)}
                    selectedTimeId={appointment.timeid ?? null}
                    onSelectTime={(timeId: number | null) => handleTimeSelectFromCalendar(index, timeId)}
                  />
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={4}>
                  <TextInput name="petname" label="Pet Name" data={appointment.petname} onChange={(e) => handleFieldChange(index, e)} error={errors[index]?.petname} />
                </Col>

                <Col md={4}>
                  <SelectInput
                    name="servicecategoryid"
                    label="Service Category"
                    data={appointment.servicecategoryid}
                    onChange={(e) => handleFieldChange(index, e)}
                    options={selectOptions.servicecattype}
                    error={errors[index]?.servicecategoryid}
                    selectProps={{ placeholder: "" }}
                  />
                </Col>

                {(isGroomService(appointment) || isDaycareService(appointment)) && (
                  <Col md={4}>
                    <SelectInput
                      name="sizeid"
                      label="Size"
                      data={appointment.sizeid}
                      onChange={(e) => handleFieldChange(index, e)}
                      options={selectOptions.size}
                      error={errors[index]?.sizeid}
                      selectProps={{ placeholder: "" }}
                    />
                  </Col>
                )}

                {isGroomService(appointment) && (
                  <Col md={4}>
                    <SelectInput
                      name="typeid"
                      label="Type"
                      data={appointment.typeid}
                      onChange={(e) => handleFieldChange(index, e)}
                      options={getTypeOptions(appointment)}
                      error={errors[index]?.typeid}
                      selectProps={{ placeholder: "" }}
                    />
                  </Col>
                )}

                {isDaycareService(appointment) && (
                  <Col md={4}>
                    <SelectInput
                      name="durationid"
                      label="Duration"
                      data={appointment.durationid}
                      onChange={(e) => handleFieldChange(index, e)}
                      options={getDurationOptions()}
                      error={errors[index]?.durationid}
                      selectProps={{ placeholder: "" }}
                    />
                  </Col>
                )}

                <Col md={4}>
                  <SelectInput
                    name="additionalserviceid"
                    label="Additional Service (Optional)"
                    data={appointment.additionalserviceid}
                    onChange={(e) => handleFieldChange(index, e)}
                    options={[]}
                    selectProps={{ placeholder: "" }}
                  />
                </Col>

                {((isGroomService(appointment) && appointment.typeid && appointment.sizeid) || (isDaycareService(appointment) && appointment.durationid && appointment.sizeid)) && (
                  <Col md={4}>
                    <TextInput
                      name="price"
                      label="Price (₱)"
                      data={isLoadingPrice[index] ? "Loading..." : appointment.price ? `${appointment.price}` : ""}
                      onChange={() => {}}
                      error={errors[index]?.price}
                      readOnly={true}
                    />
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        ))}

        <div className="border-top pt-3">
          <Row className="mb-3">
            <Col md={4}>
              <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                <strong>Total Price:</strong>
                <strong>₱{data.totalamount.toFixed(2)}</strong>
              </div>
            </Col>
          </Row>

          <Row>
            <Col md={3} className="mx-auto d-flex justify-content-center">
              <Button type="submit" className="btn-success w-100">
                {mode === "create" ? `Book ${data.appointments.length} Appointment${data.appointments.length > 1 ? "s" : ""}` : "Update"}
              </Button>
            </Col>
          </Row>
        </div>
      </div>
    </Form>
  );
};

export default AppointmentForm;
