const DATA_PREFIX = "data:";

export const generateFilenameFromDataURL = (plainUrl) => {
    const result = plainUrl.match(/^data:image\/(bmp|jpeg|apng|png|gif|x\-icon|svg\+xml|webp)/);
    let type = "";
    if (result.length === 2) {
        type = result[1] === "jpeg" ? "jpg" : result[1];
    }
    return location.hostname + "." + type;
};

export const getFilename = (plainUrl) => {
    if (plainUrl.startsWith(DATA_PREFIX)) {
        return generateFilenameFromDataURL(plainUrl);
    }
    if (plainUrl.startsWith("http:") || plainUrl.startsWith("https:")) {
        try {
            const path = (new URL(plainUrl)).pathname;
            const parts = path.split("/");
            const lastPart = parts[parts.length - 1];
            if (lastPart === "") {
                return location.hostname;
            }
            return lastPart;
        }
        catch {
            return location.hostname;
        }
    }
    return location.hostname;
}
