interface MessageProps {
    text: string;
    isAgent: boolean;
}

export const Message = ({ text, isAgent }: MessageProps) => {
    return (
        <div
            style={{
                alignSelf: isAgent ? "flex-start" : "flex-end",
                backgroundColor: isAgent ? "#f0f0f0" : "#0070f3",
                color: isAgent ? "#333" : "#fff",
                borderRadius: "12px",
                padding: "8px 12px",
                margin: "4px 0",
                maxWidth: "70%",
            }}
        >
            {text}
        </div>
    );
};
