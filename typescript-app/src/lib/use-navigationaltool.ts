import { useSearchParams } from "react-router-dom";

export const useToggleParam = (toggleToParam: string) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const fnToggleParam = () => {
    const sPane = searchParams.get(toggleToParam) || "0";
    if (Number(sPane) > 0) {
      searchParams.delete(toggleToParam);
    } else {
      searchParams.set(toggleToParam, "1");
    }
    setSearchParams(searchParams);
  };

  return fnToggleParam;
};
