import { useRef } from 'react';
import './TableMap.css';

export default function TableMap({
  mode = 'client',
  tables = [],
  onUpdateTables,
  onSelectTable,
  selectedTableId
}) {
  const areaRef = useRef(null);
  const dragId = useRef(null);
  const resizeState = useRef(null);

  const handleTableClick = (e, table) => {
    e.stopPropagation();
    if (mode === 'client') {
      if (table.isAvailable && onSelectTable) onSelectTable(table.id);
    } else {
      if (onSelectTable) onSelectTable(table.id);
    }
  };

  const handleAreaClick = (e) => {
    if (mode !== 'admin') return;
    if (!e.target.classList.contains('table-map-area')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const newTable = {
      id: Date.now().toString(),
      number: tables.length + 1,
      label: String(tables.length + 1),
      x, y,
      capacity: 2,
      isAvailable: true,
      shape: 'shape-sq',
      isVip: false
    };
    if (onUpdateTables) onUpdateTables([...tables, newTable]);
  };

  const handleDragStart = (e, id) => {
    dragId.current = id;
  };

  const handleDrop = (e) => {
    if (mode !== 'admin' || !dragId.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (onUpdateTables) {
      onUpdateTables(tables.map(t => t.id === dragId.current ? { ...t, x, y } : t));
    }
    dragId.current = null;
  };

  const handleResizeStart = (e, table, handle) => {
    if (mode !== 'admin') return;
    e.stopPropagation();
    e.preventDefault();
    resizeState.current = {
      type: 'resize',
      id: table.id,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: table.width || 5,
      startHeight: table.height || 3
    };
  };

  const handlePointerMove = (e) => {
    const state = resizeState.current;
    if (!state || state.type !== 'resize') return;
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const deltaX = ((e.clientX - state.startX) / rect.width) * 100;
    const deltaY = ((e.clientY - state.startY) / rect.height) * 100;
    const table = tables.find(t => t.id === state.id);
    if (!table) return;

    let newWidth = state.startWidth;
    let newHeight = state.startHeight;

    if (state.handle === 'right') {
      newWidth = state.startWidth + deltaX;
    } else if (state.handle === 'left') {
      newWidth = state.startWidth - deltaX;
    } else if (state.handle === 'bottom') {
      newHeight = state.startHeight + deltaY;
    } else if (state.handle === 'top') {
      newHeight = state.startHeight - deltaY;
    }

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    newWidth = clamp(newWidth, 3, 40);
    newHeight = clamp(newHeight, 3, 40);

    if (onUpdateTables) {
      onUpdateTables(tables.map(t => t.id === state.id ? { ...t, width: newWidth, height: newHeight } : t));
    }
  };

  const handlePointerUp = () => {
    resizeState.current = null;
  };

  return (
    <div className="table-map-wrapper">
      <div
        className="table-map-area"
        ref={areaRef}
        onClick={handleAreaClick}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        role="application"
      >
        <div className="map-title">Sélectionnez votre table</div>

        {tables?.map(table => {
          let statusClass = table.isAvailable ? 'available' : 'unavailable';
          if (table.isVip) statusClass = 'vip';
          const isSelected = selectedTableId === table.id;
          const rotate = table.rotation || 0;
          const scale = isSelected ? 1.08 : 1;
          const tableStyle = {
            left: `${table.x}%`,
            top: `${table.y}%`,
            transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${scale})`,
            ...(table.width ? { width: `${table.width}%` } : {}),
            ...(table.height ? { height: `${table.height}%` } : {})
          };

          return (
            <div
              key={table.id}
              className={`restaurant-table ${statusClass} ${table.shape || 'shape-sq'} ${isSelected ? 'selected' : ''}`}
              style={tableStyle}
              onClick={(e) => handleTableClick(e, table)}
              draggable={mode === 'admin'}
              onDragStart={(e) => handleDragStart(e, table.id)}
              title={`Table ${table.number} — ${table.capacity} pers. — ${table.isVip ? 'VIP' : table.isAvailable ? 'Libre' : 'Réservée'}`}
            >
              <span className="table-number">{table.label ?? table.number}</span>
              {isSelected && mode === 'admin' && (
                <div className="resize-handles">
                  <button type="button" className="resize-handle top" onPointerDown={(e) => handleResizeStart(e, table, 'top')} />
                  <button type="button" className="resize-handle right" onPointerDown={(e) => handleResizeStart(e, table, 'right')} />
                  <button type="button" className="resize-handle bottom" onPointerDown={(e) => handleResizeStart(e, table, 'bottom')} />
                  <button type="button" className="resize-handle left" onPointerDown={(e) => handleResizeStart(e, table, 'left')} />
                </div>
              )}
            </div>
          );
        })}

        <div className="table-map-legend">
          <div className="legend-item">
            <div className="legend-dot libre" />
            <span>Libre</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot vip" />
            <span>VIP</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot reservee" />
            <span>Réservée</span>
          </div>
        </div>
      </div>

      {mode === 'admin' && (
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#666', marginTop: '8px', padding: '0 8px' }}>
          Clic sur le fond = nouvelle table · Glisser pour déplacer
        </p>
      )}
    </div>
  );
}
