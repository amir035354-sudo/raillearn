interface Props {
  title: string;
  subtitle?: string;
}

export default function PageTitle({
  title,
  subtitle,
}: Props) {
  return (
    <div className="text-center space-y-2">
      <h1 className="text-5xl font-bold text-purple-500">
        {title}
      </h1>

      {subtitle && (
        <p className="text-zinc-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}