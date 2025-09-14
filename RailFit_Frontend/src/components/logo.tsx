export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      {/* Railway/Train icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        fill="currentColor"
        viewBox="0 0 24 24"
        className="text-primary"
      >
        <path d="M12 2C8.14 2 5 2.89 5 4v6c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4V4c0-1.11-3.14-2-8-2zm4 7.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-8 0c-.83 0-1.5-.67-1.5-1.5S7.17 6.5 8 6.5s1.5.67 1.5 1.5S8.83 9.5 8 9.5z" />
        <path d="M18 16H6l-2 2v2h2l2-2h8l2 2h2v-2l-2-2zm-6 2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
      </svg>
      {/* RailFIT text */}
      <span className="text-xl font-bold text-primary">
        Rail<span className="text-blue-600">FIT</span>
      </span>
    </div>
  )
}
