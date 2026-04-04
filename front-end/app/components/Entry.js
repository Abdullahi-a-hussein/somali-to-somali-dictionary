"use client";

function Sense({ sense }) {
  const { examples } = sense;
  return (
    <div>
      <div>
        <p className="leading-relaxed text-[14px] tracking-wider font-medium text-[var(--secondary-color)]">
          {sense.definition}
        </p>
      </div>
      <div>
        <ul className="mt-2 ml-4 leading-relaxed text-[13px] tracking-widest opacity-65 font-light text-[var(--secondary-color)">
          {examples.map((example, index) => (
            <li key={index + example}>{example}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Entry({ entry }) {
  const { pos, senses } = entry;
  const senses_len = senses.length;
  return (
    <div className="mb-4">
      <div className="font-semibold text-[var(--foreground)] mt-4 mb-4">
        {pos}
      </div>
      <div className="space-y-2">
        {senses.map((sense, index) => (
          <div key={`${pos}-${index}`} className="flex items-start ml-4">
            {senses_len > 1 && (
              <span className="font-semibold text-[var(--foreground)] mr-2">
                {index + 1}
              </span>
            )}
            <Sense sense={sense} />
          </div>
        ))}
      </div>
      <hr className="h-2 min-w-[150px] text-[var(--tertiary-color)] mt-3" />
    </div>
  );
}
