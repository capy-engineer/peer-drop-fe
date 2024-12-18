export default function BackGround() {
  return (
    <div className="fixed inset-0 blur-[170px] z-0">
      <div className="absolute inset-0 w-[100vw] h-[100vh] min-w-[1000px] scale-90 rounded-full bg-white overflow-hidden">
        <div
          className="absolute inset-0 w-[100vw] h-[100vh] animate-spinBlob"
          style={{
            background:
              "conic-gradient(from 0deg, #08f, #f60, #bbffa1, #4c00ff, #ab2666, #09f)",
          }}
        ></div>
      </div>
    </div>
  );
}
