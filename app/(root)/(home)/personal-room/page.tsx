"use client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useGetCallById } from "@/hooks/useGetCallById";
import { useUser } from "@clerk/nextjs";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const Table = ({
    title,
    description,
}: {
    title: string;
    description: string;
}) => (
    <div className="flex flex-col items-start gap-2 xl:flex-row">
        <p className="text-base font-medium text-sky-1 lg:text-xl xl:min-w-32">
            {title}
        </p>
        <p className="truncate text-sm font-bold max-sm:max-w-[320px] lg:text-xl">
            {description}
        </p>
    </div>
);

const PersonalRoom = () => {
    const { user } = useUser();
    const meetingId = user?.id;
    const meetingLink = `${process.env.NEXT_PUBLIC_BASE_ENV}/meeting/${meetingId}?personal=true`;
    const { call } = useGetCallById(meetingId!);
    const client = useStreamVideoClient();
    const router = useRouter();

    const startRoom = async () => {
        if (!user || !client) return;

        const newCall = client.call("default", meetingId!);

        if (!call) {
            await newCall.getOrCreate({
                data: {
                    starts_at: new Date().toISOString(),
                },
            });
        }

        router.push(`/meeting/${meetingId}?personal=true`);
    };

    const { toast } = useToast();

    return (
        <section className="flex flex-col size-full gap-10 text-white">
            <h1 className="text-3xl font-bold">Personal Room</h1>
            <div className="w-full flex flex-col gap-8 xl:max-w-[900px]">
                <Table
                    title="Topic"
                    description={`${
                        user?.username ||
                        user?.fullName ||
                        user?.lastName ||
                        user?.emailAddresses ||
                        user?.id
                    }'s meeting room`}
                />

                <Table title="Meeting ID" description={meetingId!} />

                <Table title="Invite Link" description={meetingLink} />
            </div>
            <div className="flex gap-5 ">
                <Button className="bg-blue-1" onClick={startRoom}>
                    Start Meet
                </Button>
                <Button
                    className="bg-dark-3"
                    onClick={() => {
                        navigator.clipboard.writeText(meetingLink);
                        toast({ title: "Link copied" });
                    }}
                >
                    <Image
                        src="/icons/copy.svg"
                        alt="feature"
                        width={20}
                        height={20}
                    />
                    &nbsp; Copy Link
                </Button>
            </div>
        </section>
    );
};

export default PersonalRoom;
