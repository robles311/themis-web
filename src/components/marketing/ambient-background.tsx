export function AmbientBackground() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            top: "-10%",
            left: "15%",
            width: "45vw",
            height: "45vw",
            opacity: 0.18,
            background:
              "radial-gradient(circle, rgba(180,180,180,0.5) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            top: "30%",
            right: "-5%",
            width: "40vw",
            height: "40vw",
            opacity: 0.14,
            background:
              "radial-gradient(circle, rgba(150,150,150,0.45) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            bottom: "-10%",
            left: "30%",
            width: "50vw",
            height: "50vw",
            opacity: 0.12,
            background:
              "radial-gradient(circle, rgba(200,200,200,0.4) 0%, transparent 70%)",
          }}
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.025) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />
    </>
  );
}
