"use client";

type Props = {
  user: {
    name?: string | null;
    email?: string | null;
  };
};

export default function DashboardContent({ user }: Props) {
  return (
    <main>
      <h1>Xin chao {user.name}</h1>
      <p>{user.email}</p>
    </main>
  );
}