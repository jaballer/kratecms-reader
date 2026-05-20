import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./components/Layout";
import { PostListPage } from "./pages/PostListPage";
import { PostDetailPage } from "./pages/PostDetailPage";
import { ErrorState } from "./components/ErrorState";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: (
      <div className="mx-auto max-w-2xl px-5 py-12">
        <ErrorState
          title="Page not found"
          message="The page you requested doesn't exist."
        />
      </div>
    ),
    children: [
      { index: true, element: <PostListPage /> },
      // :slug accepts either a slug or a numeric id; numeric ids redirect
      // to the canonical slug URL inside PostDetailPage.
      { path: "posts/:slug", element: <PostDetailPage /> },
    ],
  },
]);

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
