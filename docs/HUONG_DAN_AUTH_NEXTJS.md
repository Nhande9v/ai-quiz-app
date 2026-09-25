# Huong dan lam trang Dang ky / Dang nhap voi Next.js

Tai lieu nay huong dan xay dung 2 man hinh dang ky va dang nhap giong mau AI Quiz trong anh, dong thoi giai thich luong du lieu de ban hieu Next.js xu ly authentication nhu the nao.

> Project hien tai dang dung Next.js App Router, TypeScript, MongoDB/Mongoose, `bcryptjs`, `next-auth` va `zod`.

## 1. Muc tieu sau khi lam xong

Nguoi dung co the:

- Mo `/register` de tao tai khoan.
- Chon vai tro `student` hoac `instructor`.
- Nhap ho ten, email va mat khau.
- Mo `/login` de dang nhap.
- Duoc chuyen den `/dashboard` sau khi dang nhap thanh cong.
- Khong the vao trang bao mat neu chua co session.
- Nhan duoc loi ro rang khi du lieu sai, email da ton tai hoac thong tin dang nhap khong dung.

## 2. Hieu giao dien trong anh

Ca hai man hinh deu co 2 khu vuc:

```text
+---------------------------+-----------------------------------+
| Khu vuc gioi thieu         | Khu vuc form                      |
| - logo                     | - logo va link ve trang chu      |
| - tieu de AI Quiz          | - tieu de Login/Register          |
| - mo ta san pham           | - cac input                       |
| - thong diep nho           | - nut submit                      |
| - footer nho               | - link doi qua man hinh con lai  |
+---------------------------+-----------------------------------+
```

Nen tach thanh component dung chung:

- `AuthShell`: khung chia 2 cot.
- `BrandPanel`: phan mau xanh ben trai.
- `AuthHeader`: logo, ten app, link `Back to home`.
- `TextInput`: label, input, thong bao loi.
- `PasswordInput`: input mat khau va nut `Show/Hide`.
- `RoleSelector`: chon student/instructor, chi hien tren trang dang ky.

Tren mobile, co the an `BrandPanel` hoac dua no len tren form de form van de doc.

## 3. Luong tong quat

```text
Nguoi dung nhap form
        |
        v
Client validate bang Zod
        |
        v
POST /api/auth/register hoac signIn()
        |
        v
Server validate lai du lieu
        |
        +--> Dang ky: tim email -> hash mat khau -> tao User
        |
        +--> Dang nhap: tim User -> so sanh mat khau da hash
        |
        v
Tao session trong cookie httpOnly
        |
        v
Redirect toi /dashboard
```

Diem quan trong: validate o client chi de UX tot hon. Server van phai validate lai vi client co the bi gia mao.

## 4. Cau truc thu muc de de hoc

Co the bo sung vao project hien tai nhu sau:

```text
src/
  app/
    (auth)/
      login/
        page.tsx
      register/
        page.tsx
      layout.tsx
    dashboard/
      page.tsx
    api/
      auth/
        [...nextauth]/route.ts
        register/route.ts
  components/
    auth/
      auth-shell.tsx
      login-form.tsx
      register-form.tsx
      password-input.tsx
      role-selector.tsx
  lib/
    db.ts
    validations/auth.ts
  models/
    User.ts
  types/
    next-auth.d.ts
```

`(auth)` la route group, khong xuat hien trong URL. Vi du:

- `src/app/(auth)/login/page.tsx` van co URL la `/login`.
- `src/app/(auth)/register/page.tsx` van co URL la `/register`.

## 5. Cai dat package

Project nay da co nhieu package can thiet. Neu lam project moi, cai:

```bash
npm install next-auth mongoose bcryptjs zod
npm install -D @types/bcryptjs
```

Tao `.env.local`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/ai-quiz
NEXTAUTH_SECRET=mot-chuoi-bi-mat-dai-va-ngau-nhien
NEXTAUTH_URL=http://localhost:3000
```

Khong commit `.env.local` len Git.

## 6. Tao User model

Truoc khi dung `connectDB()` trong API, tao file `src/lib/db.ts`:

```ts
import mongoose from "mongoose";

const mongoUri: string = process.env.MONGODB_URI ?? "";

if (!mongoUri) {
  throw new Error("Vui long them MONGODB_URI vao file .env.local");
}

const globalForMongoose = globalThis as typeof globalThis & {
  mongooseCache?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
};

const cached = globalForMongoose.mongooseCache ?? {
  conn: null,
  promise: null,
};

globalForMongoose.mongooseCache = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) cached.promise = mongoose.connect(mongoUri);
  cached.conn = await cached.promise;
  return cached.conn;
}
```

Ham nay giup tai su dung ket noi MongoDB trong Next.js dev mode, tranh tao qua nhieu connection moi moi khi code hot reload.

Mat khau tuyet doi khong duoc luu dang plain text.

```ts
// src/models/User.ts
import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["student", "instructor"], default: "student" },
  },
  { timestamps: true },
);

export const User = models.User || mongoose.model("User", UserSchema);
```

`select: false` giup han che viec vo tinh tra mat khau ra ngoai khi query User.

## 7. Validate du lieu bang Zod

```ts
// src/lib/validations/auth.ts
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Ho ten phai co it nhat 2 ky tu"),
  email: z.string().trim().email("Email khong hop le").toLowerCase(),
  password: z.string().min(8, "Mat khau phai co it nhat 8 ky tu"),
  role: z.enum(["student", "instructor"]),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Email khong hop le").toLowerCase(),
  password: z.string().min(1, "Vui long nhap mat khau"),
});
```

Co the dung schema nay ca o client va server, nhung server van la noi quyet dinh cuoi cung.

## 8. Luong dang ky

### Buoc 0: tao cac file dau tien

Truoc khi viet logic submit, tao dung cau truc file:

```text
src/
  app/
    (auth)/
      register/
        page.tsx
  components/
    auth/
      register-form.tsx
```

Tao file `src/app/(auth)/register/page.tsx`:
  
```tsx
import RegisterForm from "@/components/auth/register-form";

export default function RegisterPage() {
  return <RegisterForm />;
}
```

Tao file `src/components/auth/register-form.tsx`:

```tsx
"use client";

import { FormEvent, useState } from "react";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "instructor">("student");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();
      setMessage(data.message);

      if (response.ok) {
        // Sau buoc nay co the dung router.push("/login").
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch {
      setMessage("Khong the ket noi den may chu");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Ho ten
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>

      <label>
        Mat khau
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>

      <label>
        Vai tro
        <select value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
        </select>
      </label>

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Dang tao tai khoan..." : "Create account"}
      </button>

      {message && <p>{message}</p>}
    </form>
  );
}
```

Luc nay mo `http://localhost:3000/register`, form se hien ra nhung request se chua thanh cong vi API chua duoc tao. Do la binh thuong; buoc tiep theo la tao API route.

### Buoc 1: nguoi dung submit form

`RegisterForm` doc cac gia tri:

```ts
const payload = {
  name,
  email: email.trim().toLowerCase(),
  password,
  role,
};

const response = await fetch("/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
```

Trong luc cho server tra ve, disable nut submit va hien loading de nguoi dung khong bam 2 lan.

### Buoc 2: server xu ly `POST /api/auth/register`

```ts
// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations/auth";
import { User } from "@/models/User";
import { connectDB } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    await connectDB();

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email da duoc su dung" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    await User.create({ ...data, password: hashedPassword });

    return NextResponse.json({ message: "Tao tai khoan thanh cong" }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Du lieu khong hop le" }, { status: 400 });
  }
}
```

Y nghia tung buoc:

1. Doc JSON tu request.
2. Parse va validate bang Zod.
3. Ket noi database.
4. Kiem tra email da ton tai chua.
5. Hash mat khau bang `bcrypt`.
6. Luu User moi.
7. Tra HTTP status phu hop ve client.

Sau khi dang ky thanh cong, chuyen nguoi dung sang `/login` hoac tu dong dang nhap roi chuyen `/dashboard`.

## 9. Luong dang nhap voi NextAuth

Phan nay de bi roi vi co 2 file khac nhau:

```text
src/app/(auth)/login/page.tsx
    = Trang giao dien login

src/app/api/auth/[...nextauth]/route.ts
    = Noi NextAuth xu ly dang nhap va tao session
```

Khi nguoi dung bam nut login, luong chay la:

```text
LoginForm
  -> signIn("credentials", email, password)
  -> NextAuth goi authorize()
  -> authorize() tim User trong MongoDB
  -> bcrypt.compare() so sanh mat khau
  -> return thong tin user
  -> NextAuth tao session cookie
```

### Buoc 1: tao file NextAuth

Tao file:

```text
src/app/api/auth/[...nextauth]/route.ts
```

Dat code sau vao file nay:

```ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { loginSchema } from "@/lib/validations/auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        // 1. Kiem tra email va mat khau co dung format khong.
        const data = loginSchema.parse(credentials);

        // 2. Ket noi toi MongoDB.
        await connectDB();

        // 3. Tim user theo email.
        //    +password can thiet vi User model dang an truong password.
        const user = await User.findOne({ email: data.email }).select(
          "+password",
        );

        // 4. Khong tim thay user thi dang nhap that bai.
        if (!user) return null;

        // 5. So sanh mat khau nguoi dung nhap voi mat khau da hash.
        const isValid = await bcrypt.compare(data.password, user.password);
        if (!isValid) return null;

        // 6. Tra thong tin user cho NextAuth.
        //    Khong tra password ve client.
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

### Giai thich tung phan

`CredentialsProvider` nghia la dang nhap bang thong tin do nguoi dung tu nhap, o day la email va password. No khac voi dang nhap Google, GitHub hoac Facebook.

`authorize(credentials)` la ham NextAuth goi moi khi form login dung:

```text
credentials = {
  email: "user@example.com",
  password: "12345678",
}
```

Dong nay:

```ts
const data = loginSchema.parse(credentials);
```

kiem tra du lieu bang Zod. Neu email sai format hoac password rong, luong se dung tai day.

Dong nay:

```ts
const user = await User.findOne({ email: data.email }).select("+password");
```

tim user trong MongoDB. Vi User model co `select: false` cho password, can them `+password` de lay password da hash ra de so sanh.

Dong nay:

```ts
const isValid = await bcrypt.compare(data.password, user.password);
```

so sanh:

```text
Mat khau nguoi dung vua nhap
        vs
Mat khau da hash trong database
```

Khong hash mat khau moi roi so sanh chuoi, vi moi lan hash co the cho ket qua khac nhau.

Neu `authorize()` tra ve `null`, NextAuth xem la dang nhap that bai. Neu tra ve object user, NextAuth tao session.

Trong `LoginForm`:

```ts
const result = await signIn("credentials", {
  email,
  password,
  redirect: false,
});

if (result?.error) {
  setError("Email hoac mat khau khong dung");
  return;
}

router.push("/dashboard");
router.refresh();
```

NextAuth se tao va quan ly session cookie. Cookie nay nen la `httpOnly` de JavaScript tren trinh duyet khong doc duoc.

## 10. Bao ve trang dashboard

Tai server component, kiem tra session truoc khi render du lieu bao mat:

```ts
const session = await getServerSession(authOptions);

if (!session) {
  redirect("/login");
}
```

Khong chi an nut bang CSS hoac JavaScript client. Nguoi dung van co the go truc tiep URL, nen viec kiem tra phai nam o server/middleware.

## 11. Phan tach Server Component va Client Component

- `page.tsx` co the la Server Component, phu hop cho layout va kiem tra session.
- Form co state, `onSubmit`, `useState` hoac `useRouter` thi them `"use client"`.
- Khong import model Mongoose, secret hoac code server vao Client Component.
- Chi gui du lieu can thiet qua API/Server Action.

Vi du:

```tsx
// page.tsx - server component
import RegisterForm from "@/components/auth/register-form";

export default function RegisterPage() {
  return <RegisterForm />;
}
```

```tsx
// register-form.tsx
"use client";

export default function RegisterForm() {
  // state, onChange, onSubmit nam o day
  return <form>{/* cac input */}</form>;
}
```

## 12. Trang thai UI can co

Moi form nen co cac trang thai sau:

- Mac dinh: input rong, nut submit san sang.
- Dang nhap du lieu: hien placeholder va label dung.
- Dang submit: disable form, doi chu nut thanh `Dang xu ly...`.
- Loi validation: loi nam ngay duoi input tuong ung.
- Loi server: thong bao chung o tren form.
- Thanh cong: redirect va co the hien toast.
- Mat khau: nut `Show/Hide` chi doi `type="password"` thanh `type="text"`.

Thong bao dang nhap nen dung loi chung `Email hoac mat khau khong dung`, tranh tiet lo email nao ton tai trong he thong.

## 13. Mapping tu anh sang component

| Chi tiet trong anh | Component / xu ly |
| --- | --- |
| Cot xanh ben trai | `BrandPanel` |
| Logo `aq` | `Logo` |
| Chon student/instructor | `RoleSelector` + state `role` |
| Input ho ten | `TextInput name="name"` |
| Input email | `TextInput name="email"` |
| Input mat khau | `PasswordInput` |
| Nut Create account | Submit cua `RegisterForm` |
| Nut Log in | Submit cua `LoginForm` |
| Link doi trang | `Link href="/login"` / `Link href="/register"` |
| Forgot password | Link den `/forgot-password` |

Lam UI truoc bang du lieu gia, sau do noi form vao API. Cach nay giup tach bai toan giao dien khoi bai toan authentication.

## 14. Thu tu lam bai de khong bi roi

1. Tao route `/login` va `/register` voi giao dien tinh.
2. Tach `AuthShell`, `BrandPanel`, input va password input.
3. Them state cho input va nut `Show/Hide`.
4. Them validate client bang Zod.
5. Tao MongoDB connection va User model.
6. Tao API register, hash mat khau va luu User.
7. Cai `CredentialsProvider` cho NextAuth.
8. Noi `signIn()` vao form login.
9. Bao ve `/dashboard` bang session.
10. Them reset password, email verification va rate limiting sau khi luong co ban chay on.

## 15. Checklist kiem thu

- Dang ky voi email hop le thanh cong.
- Dang ky thieu ho ten bi chan.
- Mat khau ngan hon 8 ky tu bi chan.
- Dang ky lai cung email tra ve loi.
- Mat khau trong database khong phai plain text.
- Dang nhap dung chuyen den `/dashboard`.
- Dang nhap sai hien loi chung.
- Chua dang nhap truy cap `/dashboard` bi chuyen ve `/login`.
- Refresh trang van giu session.
- Logout thi session bi xoa.
- Giao dien dung tren mobile.
- Nut submit khong bi bam lap khi request dang chay.

## 16. Cac loi hay gap

### `window is not defined`

Ban dang dung API cua trinh duyet trong Server Component. Chuyen code do vao component co `"use client"`.

### `MongooseError: buffering timed out`

Kiem tra `MONGODB_URI`, database co dang chay khong va `connectDB()` co duoc goi truoc query khong.

### Dang nhap thanh cong nhung bi day ve login

Kiem tra `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, cau hinh provider va ten cookie/session.

### Mat khau luon sai

Luc dang ky phai hash mot lan. Luc dang nhap phai dung `bcrypt.compare(inputPassword, hashedPassword)`, khong hash lai roi so sanh chuoi.

## 17. Bao mat khi dua len production

- Khong luu mat khau plain text.
- Khong dat secret trong code frontend.
- Dung cookie `httpOnly`, `secure` khi chay HTTPS va `sameSite` phu hop.
- Validate lai o server.
- Them rate limit cho login va register.
- Dung loi dang nhap chung, tranh user enumeration.
- Them email verification va forgot password co token het han.
- Khong log mat khau hoac token.
- Tao index unique cho email trong database.

Neu ban nam duoc chuoi nay thi ban da hieu cot loi cua auth trong Next.js:

```text
Form Client -> API/Server Action -> Validate -> Database
           -> Hash/Compare -> Session Cookie -> Redirect
```
