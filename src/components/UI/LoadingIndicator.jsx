export default function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <div className="lds-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}
