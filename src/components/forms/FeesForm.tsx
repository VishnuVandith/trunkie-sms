"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { feesFormSchema, FeesFormSchema } from "@/lib/formValidationSchemas";
import { createFees, updateFees, getStudents } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import InputField from "../InputField";

const FeesForm = ({
  type,
  data,
  setOpen,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FeesFormSchema>({
    resolver: zodResolver(feesFormSchema),
    defaultValues: {
      amount: data?.amount || "",
      dueDate: data?.dueDate?.toISOString().split("T")[0] || "",
    },
  });

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [students, setStudents] = useState<{ id: string; name: string; parentId: string }[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      const studentsData = await getStudents();
      setStudents(studentsData);
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    if (data) {
      setValue("amount", data.amount);
      setValue("dueDate", data.dueDate?.toISOString().split("T")[0]);
      setSelectedStudent({ id: data.studentId, parentId: data.parentId });
    }
  }, [data, setValue]);

  const [state, setState] = useState<{ success: boolean; error: boolean }>({ success: false, error: false });

  const formAction = async (formData: FeesFormSchema) => {
    const result = type === "create" ? await createFees({ ...formData, paid: false }) : await updateFees(formData);
    setState(result);
  };

  const onSubmit = async (formData: FeesFormSchema) => {
    if (!selectedStudent) {
      toast.error("Please select a student.");
      return;
    }
    formAction({ ...formData, studentId: selectedStudent.id, parentId: selectedStudent.parentId });
  };

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Fees has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const studentId = e.target.value;
    const student = students.find((s) => s.id === studentId);
    setSelectedStudent(student || null);
    setValue("studentId", student?.id || "");
    setValue("parentId", student?.parentId || "");
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">{type === "create" ? "Create a new fee" : "Update the fee"}</h1>
      <InputField label="Amount" name="amount" register={register} error={errors.amount} />
      <InputField label="Due Date" name="dueDate" type="date" register={register} error={errors.dueDate} />
      <div className="flex flex-col gap-2 w-full">
        <label className="text-xs text-gray-500">Student</label>
        <select className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full" onChange={handleStudentChange}>
          <option value="">Select a student</option>
          {students.map((student) => (
            <option value={student.id} key={student.id}>
              {student.name}
            </option>
          ))}
        </select>
        {errors.studentId?.message && <p className="text-xs text-red-400">{errors.studentId.message}</p>}
      </div>
      <input type="hidden" {...register("studentId")} />
      <input type="hidden" {...register("parentId")} />
      {state.error && <span className="text-red-500">Something went wrong!</span>}
      <button type="submit" className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default FeesForm;
