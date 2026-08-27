/** Generic table wrapper — pass columns + rows */
export function Table({ columns, rows, emptyMessage = 'No data.' }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="table-wrap">
        <div className="empty-state"><p>{emptyMessage}</p></div>
      </div>
    );
  }
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key ?? c.label}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={row.id ?? ri}>
              {columns.map((c) => (
                <td key={c.key ?? c.label}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
