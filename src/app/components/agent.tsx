"use client";

import { useConversation } from "@elevenlabs/react";
import { useEffect, useState } from "react";
import { Message } from "./message";
import { UserInfo } from "../lib/saveUserInfo";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Agent = (props: any) => {
    // States
    const [messages, setMessages] = useState<{ text: string; isAgent: boolean }[]>([]);
    const [input, setInput] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const agentId: string = process.env.NEXT_PUBLIC_AGENT_ID!;
    const dynamicVariables = {
        user_name: "John Doe",
        user_email: "john.doe@example.com",
        user_phone: "+1234567890",
    };

    const saveUser = async (userInfo: UserInfo) => {
        try {
            await fetch("/api/save-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userInfo),
            });
            console.log("User info saved");
        } catch (err) {
            console.error("Error saving user info:", err);
        }
    };

    const conversation = useConversation({
        onMessage: (message) => {
            console.log("Agent:", message);
            setMessages((prev) => [...prev, { text: message.message, isAgent: true }]);

            const match = message.message.match(/[Mm]a[șs]ina ta preferat[ăa] este:?\s*(.+)/i);
            if (match) {
                const preferredCar = match[1].split(". Dore")[0].trim();
                saveUser({
                    name: dynamicVariables.user_name,
                    email: dynamicVariables.user_email,
                    phone: dynamicVariables.user_phone,
                    preferredCar,
                });
            }
        },
        onDisconnect: (error) => {
            console.log("Conversation disconnected:", error);
        },
    });

    const { status } = conversation;

    const handleStartConversation = async () => {
        try {
            await conversation.startSession({
                agentId: agentId,
                connectionType: "websocket",
                dynamicVariables: props.dynamicVariables,
            });
            console.log("Conversation started");
        } catch (err) {
            setErrorMessage((err as Error).message);
        }
    };

    const handleStopConversation = () => {
        conversation.endSession();
        setMessages([]);
    };

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        // Add user message
        setMessages((prev) => [...prev, { text: input, isAgent: false }]);

        try {
            conversation.sendUserMessage(input);
        } catch (err) {
            setErrorMessage((err as Error).message);
        }

        setInput("");
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {messages.length !== 0 && (
                <div
                    className="w-3/4 p-6 rounded-lg shadow-md"
                    style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        padding: "16px",
                        marginBottom: "16px",
                        backgroundColor: "#fafafa",
                        minHeight: "250px",
                        maxHeight: "900px",
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column-reverse",
                    }}
                >
                    <div style={{ display: "flex", marginTop: "12px" }}>
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                            style={{
                                flex: 1,
                                padding: "8px",
                                borderRadius: "4px",
                                border: "1px solid #e5e7eb",
                                marginRight: "8px",
                                color: "#333",
                            }}
                        />
                        <button
                            onClick={handleSendMessage}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#0070f3",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                            }}
                        >
                            Send
                        </button>
                    </div>
                    <div className="messages flex flex-col">
                        {messages.map((msg, index) => (
                            <Message key={index} text={msg.text} isAgent={msg.isAgent} />
                        ))}
                    </div>
                    {errorMessage && <p style={{ color: "red" }}>Error: {errorMessage}</p>}
                </div>
            )}

            <div className="flex gap-2">
                {status !== "connected" && (
                    <button
                        onClick={handleStartConversation}
                        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                    >
                        Start Conversation
                    </button>
                )}
                {status === "connected" && (
                    <button
                        onClick={handleStopConversation}
                        className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
                    >
                        Stop Conversation
                    </button>
                )}
            </div>
            <div className="flex flex-col items-center">
                <p>Status: {status}</p>
            </div>
        </div>
    );
};
