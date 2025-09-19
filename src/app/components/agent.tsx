"use client";

import { useConversation } from "@elevenlabs/react";
import { useEffect, useState } from "react";
import { Message } from "./message";
import { Masina, UserInfo } from "../lib/saveUserInfo";
import { createClient } from "@supabase/supabase-js";

async function getSignedUrl() {
    const response = await fetch("/api/signed-url");

    if (!response.ok) {
        throw new Error("Failed to get signed URL");
    }

    const data = await response.json();
    return data.signedUrl;
}

export const Agent = () => {
    const [messages, setMessages] = useState<{ text: string; isAgent: boolean }[]>([]);
    const [input, setInput] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [userInfo, setUserInfo] = useState<Partial<UserInfo>>({});

    const agentId: string = process.env.NEXT_PUBLIC_AGENT_ID!;

    const conversation = useConversation({
        textOnly: true,
        onMessage: (message) => {
            console.log("Agent:", message);
            setMessages((prev) => [...prev, { text: message.message, isAgent: true }]);
        },
        onDisconnect: (error) => {
            console.log("Conversation disconnected:", error);
        },
        clientTools: {
            getUserName: (nume: { nume: string }) => {
                console.log("getUserName called with:", nume);
                setUserInfo((prev) => ({ ...prev, nume: nume.nume }));
            },
            getUserEmail: (email: { email: string }) => {
                console.log("getUserEmail called with:", email);
                setUserInfo((prev) => ({ ...prev, email: email.email }));
            },
            getUserPhone: (tel: { tel: string }) => {
                console.log("getUserPhone called with:", tel);
                setUserInfo((prev) => ({ ...prev, tel: tel.tel }));
            },
            getUserFavoriteCar: (masina: { masina: Masina }) => {
                console.log("getUserFavoriteCar called with:", masina);
                setUserInfo((prev) => ({ ...prev, masina: masina.masina }));
            },
        },
    });

    const { status } = conversation;

    const handleStartConversation = async () => {
        try {
            await conversation.startSession({
                signedUrl: await getSignedUrl(),
                agentId: agentId,
                connectionType: "websocket",
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
    // && userInfo.email && userInfo.tel && userInfo.masina
    useEffect(() => {
        if (userInfo.nume) {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            supabase
                .from("dotari")
                .select()
                .then((data) => console.log(data));

            console.log("Final user info:", userInfo);
        }
    }, [userInfo]);

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
