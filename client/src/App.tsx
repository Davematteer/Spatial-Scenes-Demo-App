import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "./components/Home";
import { RootLayout } from "./RootLayout";

const router = createBrowserRouter([
    {
        Component: RootLayout,
        children: [
            { path: "/", Component: Home }
        ]
    }
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;