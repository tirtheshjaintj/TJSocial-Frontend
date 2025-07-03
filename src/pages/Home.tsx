import type { titleProp } from "../types";
import usePageSetup from "../hooks/usePageSetup";

function Home({ title }: titleProp) {
    usePageSetup(title);
    return (
        <>
        </>
    )
}

export default Home