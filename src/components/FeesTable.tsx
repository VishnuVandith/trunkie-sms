"use client";
import React, { useState } from 'react';
import TableSearch from './TableSearch';
import PaymentModal from './PaymentModal';

interface FeesTableProps {
    feesData: any[];
    role: string;
}

const FeesTable: React.FC<FeesTableProps> = ({ feesData, role }) => {
    const [selectedFeeId, setSelectedFeeId] = useState<number | null>(null);
    const [fees, setFees] = useState(feesData);

    const handlePayment = (feeId: number) => {
        setSelectedFeeId(feeId);
    };

    const handlePaymentSuccess = () => {
        setFees(fees.map(fee => fee.id === selectedFeeId ? { ...fee, paid: true } : fee));
    };

    return (
        <div className="overflow-x-auto mt-4">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-2">Amount</th>
                        <th className="text-left px-4 py-2">Due Date</th>
                        {role === "admin" && <th className="text-left px-4 py-2">Student</th>}
                        {role === "admin" && <th className="text-left px-4 py-2">Parent</th>}
                        <th className="text-left px-4 py-2">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {fees.map((fee, index) => (
                        <tr key={fee.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} text-sm hover:bg-lamaPurpleLight`}>
                            <td className="px-4 py-2">{fee.amount}</td>
                            <td className="px-4 py-2">{new Date(fee.dueDate).toLocaleDateString()}</td>
                            {role === "admin" && <td className="px-4 py-2">{fee.student.name} {fee.student.surname}</td>}
                            {role === "admin" && <td className="px-4 py-2">{fee.parent.name} {fee.parent.surname}</td>}
                            <td className="px-4 py-2">
                                {role === "admin" ? (
                                    <div className={`rounded-md w-36 mr-2 ${fee.paid ? "text-black" : "text-red-600"}`}>
                                        {fee.paid ? "Paid" : "Pending"}
                                    </div>
                                ) : (
                                    <button className="border-2 border-black rounded-md w-36" disabled={fee.paid} onClick={() => handlePayment(fee.id)}>
                                        {fee.paid ? "Paid" : "Pay"}
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {selectedFeeId !== null && (
                <PaymentModal
                    feeId={selectedFeeId}
                    onClose={() => setSelectedFeeId(null)}
                    onPaymentSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
};

export default FeesTable;
