import { useTranslation } from "mo-sdk";

export function EmotivPreview() {
    const { t } = useTranslation("interaction-lab-emotiv-capture");

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                border: "1px dashed #ccc",
                borderRadius: "8px",
                background: "#fdfdfd",
                color: "#555",
                height: "100%",
                minHeight: "150px"
            }}
        >
            <div style={{ fontSize: "2rem", marginBottom: "10px" }}></div>
            <div style={{ fontWeight: "bold" }}>{t("preview_title") || "Emotiv Data"}</div>
            <div style={{ fontSize: "0.9rem" }}>{t("preview_desc") || "Brainwave & Metrics Visualization"}</div>
        </div>
    );
}