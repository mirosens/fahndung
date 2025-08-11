# Modern Pagination Component

Eine moderne, responsive Pagination-Komponente mit Glassmorphismus-Design für das Fahndungssystem.

## 🚀 Features

- ✅ **6 Items per Page** (anpassbar)
- ✅ **Glassmorphismus 2025** Design
- ✅ **Dark/Light Mode** Support
- ✅ **Quick Jump** für große Listen
- ✅ **Responsive Design**
- ✅ **Accessibility** (ARIA-Labels, Keyboard Navigation)
- ✅ **TypeScript Support**
- ✅ **Smooth Animationen**

## 📦 Installation

Die Komponente ist bereits im Projekt integriert. Lucide Icons sind bereits installiert.

## 🎯 Verwendung

### Einfache Verwendung

```tsx
import { useState } from 'react';
import { ModernPagination } from '~/components/pagination';

export const FahndungsListe = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Ihre Fahndungsdaten
  const fahndungen = [...]; // Ihre Daten

  // Aktuelle Items für die Seite berechnen
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = fahndungen.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      {/* Ihre Fahndungskarten rendern */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map(fahndung => (
          <Fahndungskarte key={fahndung.id} data={fahndung} />
        ))}
      </div>

      {/* Pagination */}
      <ModernPagination
        currentPage={currentPage}
        totalItems={fahndungen.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        showItemsInfo={true}
        showQuickJump={true}
      />
    </div>
  );
};
```

### Mit FahndungskarteGridWithPagination

```tsx
import FahndungskarteGridWithPagination from "~/components/fahndungskarte/ansichten/FahndungskarteGridWithPagination";

<FahndungskarteGridWithPagination
  investigations={filteredInvestigations}
  viewMode="grid-3"
  itemsPerPage={6}
  showPagination={true}
  showItemsInfo={true}
  showQuickJump={true}
  userPermissions={userPermissions}
/>;
```

## 🎨 Props

### ModernPagination

| Prop            | Typ                      | Default | Beschreibung                              |
| --------------- | ------------------------ | ------- | ----------------------------------------- |
| `currentPage`   | `number`                 | -       | Aktuelle Seite (erforderlich)             |
| `totalItems`    | `number`                 | -       | Gesamtanzahl der Items (erforderlich)     |
| `itemsPerPage`  | `number`                 | `6`     | Items pro Seite                           |
| `onPageChange`  | `(page: number) => void` | -       | Callback bei Seitenwechsel (erforderlich) |
| `className`     | `string`                 | `""`    | Zusätzliche CSS-Klassen                   |
| `showItemsInfo` | `boolean`                | `true`  | Zeige "Zeige X-Y von Z Einträgen"         |
| `showQuickJump` | `boolean`                | `false` | Zeige Quick-Jump für große Listen         |

### FahndungskarteGridWithPagination

Zusätzlich zu den Standard-Grid-Props:

| Prop             | Typ       | Default | Beschreibung     |
| ---------------- | --------- | ------- | ---------------- |
| `itemsPerPage`   | `number`  | `6`     | Items pro Seite  |
| `showPagination` | `boolean` | `true`  | Zeige Pagination |
| `showItemsInfo`  | `boolean` | `true`  | Zeige Items-Info |
| `showQuickJump`  | `boolean` | `false` | Zeige Quick-Jump |

## 🎨 Design Features

- **Glassmorphismus**: Moderne Transparenz-Effekte mit `backdrop-blur`
- **Responsive**: Funktioniert auf allen Bildschirmgrößen
- **Dark Mode**: Automatische Anpassung an das Theme
- **Hover-Effekte**: Smooth Scale-Animationen
- **Accessibility**: Vollständige Keyboard-Navigation und ARIA-Labels

## 🔧 Anpassung

Die Komponente verwendet Tailwind CSS. Sie können das Design durch Anpassung der CSS-Klassen ändern:

```tsx
<ModernPagination
  className="custom-pagination"
  // ... andere props
/>
```

## 📱 Performance

- **GPU-optimiert** mit `backdrop-blur`
- **Memoized** Pagination-Berechnungen
- **Lazy Loading** für große Listen
- **Smooth Animationen** mit CSS Transitions

## ♿ Accessibility

- **Keyboard Navigation**: Pfeiltasten, Enter, Space
- **ARIA Labels**: Vollständige Screen Reader Unterstützung
- **Focus Management**: Automatische Focus-Verwaltung
- **Reduced Motion**: Respektiert `prefers-reduced-motion`
