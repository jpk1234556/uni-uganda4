export default function Search() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Find Hostels</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="col-span-1 border rounded-lg p-4 bg-card h-fit">
          <h2 className="font-semibold mb-4 text-lg">Filters</h2>
          <p className="text-sm text-muted-foreground">Filters coming soon...</p>
        </aside>
        <div className="col-span-1 md:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-6 bg-card flex flex-col items-center justify-center h-48">
              <span className="text-muted-foreground">Hostel placeholders loading...</span>
            </div>
            <div className="border rounded-lg p-6 bg-card flex flex-col items-center justify-center h-48">
              <span className="text-muted-foreground">Hostel placeholders loading...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
