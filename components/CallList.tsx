"use client";
import { useGetCall } from "@/hooks/useGetCall";
import { Call, CallRecording } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import MeetingCard from "./MeetingCard";
import Loader from "./Loader";
import { useToast } from "./ui/use-toast";

const CallList = ({ type }: { type: "upcoming" | "recordings" | "ended" }) => {
    const { endedCalls, upcomingCalls, callrecordings, isLoading } =
        useGetCall();

    const router = useRouter();
    const [recordings, setRecordings] = useState<CallRecording[]>([]);
    const { toast } = useToast();

    const getCall = () => {
        switch (type) {
            case "upcoming":
                return upcomingCalls;
            case "ended":
                return endedCalls;
            case "recordings":
                return recordings;
            default:
                return [];
        }
    };

    const getNoCallsMessage = () => {
        switch (type) {
            case "upcoming":
                return "No upcoming calls";
            case "ended":
                return "No previous calls";
            case "recordings":
                return "No recordings";
            default:
                return "";
        }
    };

    const getCardIconByType = () => {
        switch (type) {
            case "upcoming":
                return "/icons/upcoming.svg";
            case "ended":
                return "/icons/previous.svg";

            default:
                return "/icons/recordings.svg";
        }
    };

    useEffect(() => {
        const fetchRecordings = async () => {
            try {
                const callData = await Promise.all(
                    callrecordings?.map((meeting) =>
                        meeting.queryRecordings()
                    ) ?? []
                );

                const recordings = callData
                    .filter((call) => call.recordings.length > 0)
                    .flatMap((call) => call.recordings);
                setRecordings(recordings);
            } catch (error) {
                toast({ title: "Try again later" });
                console.log(error);
            }
        };

        if (type === "recordings") {
            fetchRecordings();
        }
    }, [type, callrecordings, toast]);

    const calls = getCall();
    const noCallsMessage = getNoCallsMessage();

    if (isLoading) return <Loader />;

    return (
        <div className="grid grid-cols-1 gap-5  xl:grid-cols-2">
            {calls && calls.length > 0 ? (
                calls.map((meeting: Call | CallRecording) => (
                    <MeetingCard
                        key={(meeting as Call).id}
                        title={
                            (
                                meeting as Call
                            ).state?.custom?.description?.substring(0, 26) ||
                            (meeting as CallRecording).filename?.substring(
                                0,
                                20
                            ) ||
                            "Personal meeting"
                        }
                        date={
                            (
                                meeting as Call
                            ).state?.startsAt?.toLocaleString() ||
                            (
                                meeting as CallRecording
                            ).start_time?.toLocaleString()
                        }
                        icon={getCardIconByType()}
                        isPreviousMeeting={type === "ended"}
                        buttonIcon1={
                            type === "recordings"
                                ? "/icons/play.svg"
                                : undefined
                        }
                        buttonText={type === "recordings" ? "Play" : "Start"}
                        handleClick={
                            type === "recordings"
                                ? () => {
                                      router.push(
                                          `${(meeting as CallRecording).url}`
                                      );
                                  }
                                : () => {
                                      router.push(
                                          `/meeting/${(meeting as Call).id}`
                                      );
                                  }
                        }
                        link={
                            type === "recordings"
                                ? (meeting as CallRecording).url
                                : `${
                                      process.env.NEXT_PUBLIC_BASE_URL
                                  }/meeting/${(meeting as Call).id}`
                        }
                    />
                ))
            ) : (
                <h1>{noCallsMessage}</h1>
            )}
        </div>
    );
};

export default CallList;
