"use client";

import { useConversation } from "@elevenlabs/react";
import { useEffect, useState } from "react";
import { Message } from "./message";
import { UserInfo } from "../lib/userInfo";
import { Masina } from "../lib/masina";
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
    const [userLocations, setUserLocations] = useState<string[]>([]);

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
            getUserLocations: (locations: { locations: string[] }) => {
                console.log("getUserLocations called with: ", locations.locations);
                setUserLocations(locations.locations);
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

    useEffect(() => {
        async function saveData() {
            if (userInfo.nume && userInfo.email && userInfo.tel && userInfo.masina) {
                console.log("Saving data...");
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );

                const locatii = await supabase
                    .from("locatii")
                    .upsert(
                        userInfo.masina?.locatiiDisponibile.map((l) => ({ locatie: l })),
                        { onConflict: "locatie" }
                    )
                    .select("id");

                const dotari = await supabase
                    .from("dotari")
                    .upsert(
                        userInfo.masina?.dotari.map((d) => ({ dotare: d })),
                        { onConflict: "dotare" }
                    )
                    .select("id");

                const masini = await supabase
                    .from("masini")
                    .insert({
                        marca: userInfo.masina?.marca,
                        model: userInfo.masina?.model,
                        an_fabricatie: userInfo.masina?.anFabricatie,
                        pret: userInfo.masina?.pret,
                        tip_masina: userInfo.masina?.tipMasina,
                        combustibil: userInfo.masina?.combustibil,
                    })
                    .select("id");

                const locatii_masini = locatii.data?.map((l) => ({
                    id_masina: masini.data![0].id,
                    id_locatie: l.id,
                }));
                await supabase.from("locatie_masina").insert(locatii_masini);

                const dotari_masini = dotari.data?.map((d) => ({
                    id_masina: masini.data![0].id,
                    id_dotare: d.id,
                }));

                await supabase.from("dotare_masina").insert(dotari_masini);

                const id_user = await supabase
                    .from("user_info")
                    .insert({
                        nume: userInfo.nume,
                        email: userInfo.email,
                        tel: userInfo.tel,
                        id_masina: masini.data![0].id,
                    })
                    .select("id");

                const locatii_user = await supabase
                    .from("locatii")
                    .upsert(
                        userLocations.map((l) => ({ locatie: l })),
                        { onConflict: "locatie" }
                    )
                    .select("id");
                const locatii_user_model = locatii_user.data?.map((l) => ({
                    id_locatie: l.id,
                    id_user: id_user.data![0].id,
                }));
                await supabase.from("locatie_user").insert(locatii_user_model);
            }
        }
        saveData().then((res) => console.log("final response: ", res));
    }, [userInfo, userLocations]);

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
