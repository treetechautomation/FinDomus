import Link from 'next/link';

export default function NotFound() {
return ( <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground"> <div className="max-w-md text-center"> <p className="text-sm font-semibold text-primary">404</p> <h1 className="mt-3 text-3xl font-bold">Página não encontrada</h1> <p className="mt-3 text-muted-foreground">
A página que você tentou acessar não existe ou foi movida. </p> <Link
       href="/"
       className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
     >
Voltar ao início </Link> </div> </main>
);
}
