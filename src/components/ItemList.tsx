import { ItemCard } from './ItemCard'
import type { Item } from '../types'

export function ItemList({ items, query = '' }: { items: Item[]; query?: string }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-gray-500 px-1">
        {items.length} {items.length === 1 ? 'result' : 'results'}
      </p>
      {items.map(item => (
        <ItemCard key={item.id} item={item} query={query} />
      ))}
    </div>
  )
}
