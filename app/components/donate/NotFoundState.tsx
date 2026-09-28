interface NotFoundStateProps {
  username: string;
}

export function NotFoundState({ username }: NotFoundStateProps) {
  return (
    <div className="flex flex-col items-center text-center gap-2 py-10 animate-fade-in">
      <h1 className="text-lg font-extrabold tracking-tight text-ink-heading">
        Streamer não encontrado
      </h1>
      <p className="text-[13px] font-medium text-ink-muted leading-relaxed max-w-[36ch]">
        Não encontramos ninguém em{" "}
        <span className="font-bold text-ink-body">@{username}</span>. Confira o link e tente
        novamente.
      </p>
    </div>
  );
}
