import React from "react";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client"; // Import Prisma types
import { auth } from "@clerk/nextjs/server";
import FeesTable from "@/components/FeesTable";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";
import Image from "next/image";
import FormContainer from "@/components/FormContainer";

type Fee = {
  id: number;
  amount: number;
  dueDate: string;
  student?: {
    name: string;
    surname: string;
  };
  parent?: {
    name: string;
    surname: string;
  };
};

const Page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = auth();
  const role = sessionClaims?.role as string;
  let feesData: Fee[] = [];
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // Define the query object with proper type
  const query: Prisma.FeesWhereInput = {};

  // Build the query dynamically
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.student = {
              is: {
                name: {
                  contains: value,
                  mode: "insensitive",
                },
              },
            };
            break;
          default:
            break;
        }
      }
    }
  }
  

  // Fetch fees data based on the role
  if (role === "admin") {
    const rawFeesData = await prisma.fees.findMany({
      where: query,
      include: {
        student: { select: { name: true, surname: true } },
        parent: { select: { name: true, surname: true } },
      },
      take: 10,
      skip: 10 * (p - 1),
    });

    feesData = rawFeesData.map((fee) => ({
      ...fee,
      dueDate: fee.dueDate.toISOString(),
    }));
  } else if (role === "parent") {
    const rawFeesData = await prisma.fees.findMany({
      where: { parentId: userId || "" },
    });

    feesData = rawFeesData.map((fee) => ({
      ...fee,
      dueDate: fee.dueDate.toISOString(),
    }));
  }

  // Get the total count for pagination
  const count = await prisma.fees.count({ where: query });

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">All Fees</h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/filter.png" alt="" width={14} height={14} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/sort.png" alt="" width={14} height={14} />
              </button>
              {role === "admin" && (
                <>
                  <FormContainer table="fees" type="create" />
                </>
              )}
            </div>
          </div>
        </div>
        <FeesTable feesData={feesData} role={role} />
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default Page;
