import fs from "fs";
import path from "path";

export interface UserInfo {
    name: string;
    email: string;
    phone: string;
    preferredCar: string;
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
