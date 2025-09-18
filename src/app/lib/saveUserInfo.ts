import fs from "fs";
import path from "path";

export interface UserInfo {
    nume: string;
    email: string;
    tel: string;
    masina: {
        marca: string;
        model: string;
        anFabricatie: number;
        pret: number;
        tipMasina: string;
        combustibil: string;
        locatiiDisponibile: string[];
        dotari: string[];
    };
}

export const saveUserInfo = (userInfo: UserInfo) => {
    const filePath = path.join(process.cwd(), "userSelections.json");

    let existingData: UserInfo[] = [];
    if (fs.existsSync(filePath)) {
        existingData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }

    existingData.push(userInfo);
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), "utf-8");
};
