import { useEffect } from "react";

const usePageSetup = (title: string) => {
    useEffect(() => {
        document.title = `TJ Social: ${title}`;
        window.scrollTo(0, 0);
    }, [title]);
};

export default usePageSetup;
