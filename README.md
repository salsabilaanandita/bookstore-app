# Wiring these files into bookstore-app (Next.js)

1. Install zustand: `npm install zustand`
2. Copy `lib/api.js` and `lib/useSession.js` into your `lib/` folder.
3. Copy `components/AuthProvider.jsx`, `RequireRole.jsx`, `LoginForm.jsx` into `components/`.
4. Add `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   ```
5. Wrap your root layout with AuthProvider (app/layout.js):
   ```jsx
   import AuthProvider from "@/components/AuthProvider";

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           <AuthProvider>{children}</AuthProvider>
         </body>
       </html>
     );
   }
   ```
6. Login page (app/login/page.jsx):
   ```jsx
   import LoginForm from "@/components/LoginForm";
   export default function LoginPage() {
     return <LoginForm />;
   }
   ```
7. Guard a role-specific page, e.g. app/admin/page.jsx:
   ```jsx
   "use client";
   import RequireRole from "@/components/RequireRole";

   export default function AdminPage() {
     return (
       <RequireRole roles={["admin"]}>
         <div>Admin dashboard content</div>
       </RequireRole>
     );
   }
   ```
8. Call the API anywhere with `import { api } from "@/lib/api"`, e.g.:
   ```jsx
   "use client";
   import { useEffect, useState } from "react";
   import { api } from "@/lib/api";

   export default function BrowsePage() {
     const [books, setBooks] = useState([]);
     useEffect(() => {
       api.books.list({ sort: "newest" }).then((data) => setBooks(data.items));
     }, []);
     return <ul>{books.map((b) => <li key={b.id}>{b.title}</li>)}</ul>;
   }
   ```

## Notes

- Public endpoints (`books.list`, `books.get`, `categories.list`) work fine even
  before login — no token needed.
- Everything else (cart, wishlist, orders, library, admin routes) requires the
  user to be logged in; `api.js` attaches the token automatically once
  `useSession.login()` has run.
- This is a browser-storage token, not an httpOnly cookie, so it can't be
  checked in Next.js middleware (edge runtime). Route protection here is done
  client-side via `RequireRole`. If you need server-side route protection later,
  the Express API would need to also set an httpOnly cookie on login.
- If you see a CORS error in devtools, double check `FRONTEND_ORIGIN` in the
  API's `.env` matches the exact origin (protocol + host + port) your Next.js
  app runs on.
