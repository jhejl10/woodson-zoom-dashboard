"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Phone, MessageSquare, Plus, Search, Edit, Building, User, Filter } from "lucide-react"

// REMOVE MOCK DATA
// const phonebookEntries = [...]

const categories = ["All", "Medical", "Business", "Personal", "Legal", "Emergency"]

function PhonebookEntry({ entry }: { entry: any }) {
  const primaryNumber = entry.numbers?.find((n: any) => n.isPrimary) || entry.numbers?.[0]

  return (
    <div className="flex items-center space-x-4 p-4 hover:bg-muted/50 rounded-lg">
      <Avatar className="h-10 w-10">
        <AvatarImage src={entry.avatar || "/placeholder.svg"} alt={entry.name} />
        <AvatarFallback>
          {entry.company ? (
            <Building className="h-4 w-4" />
          ) : (
            entry.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
          )}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{entry.name}</p>
          <Badge variant="outline" className="text-xs">
            {entry.category}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">{entry.company}</p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-muted-foreground">{primaryNumber?.number}</p>
          {entry.numbers?.length > 1 && (
            <Badge variant="secondary" className="text-xs">
              +{entry.numbers.length - 1} more
            </Badge>
          )}
        </div>
        {entry.notes && <p className="text-xs text-muted-foreground truncate mt-1">{entry.notes}</p>}
      </div>

      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Phone className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MessageSquare className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Edit className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

function AddEntryDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Phonebook Entry</DialogTitle>
          <DialogDescription>Add a new contact to your custom phonebook</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Contact name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" placeholder="Company name" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="primary-number">Primary Phone Number</Label>
            <Input id="primary-number" placeholder="+1 (555) 123-4567" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="contact@example.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter((c) => c !== "All")
                  .map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this contact..."
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Add Entry</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function PhonebookView() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [phonebookEntries, setPhonebookEntries] = useState([])
  const [loading, setLoading] = useState(true)

  // TODO: Replace with real API call when available
  // For now, show empty state

  const filteredEntries = phonebookEntries.filter((entry: any) => {
    const matchesSearch =
      entry.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.numbers?.some((n: any) => n.number.includes(searchTerm)) ||
      entry.notes?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "All" || entry.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Phonebook</CardTitle>
          <CardDescription>Manage your custom contacts to better identify incoming and outgoing calls</CardDescription>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{phonebookEntries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length - 1}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Business</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {phonebookEntries.filter((e: any) => e.category === "Business").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personal</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {phonebookEntries.filter((e: any) => e.category === "Personal").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts, numbers, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <AddEntryDialog />
      </div>

      {/* Phonebook Entries */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Contacts</CardTitle>
            <p className="text-sm text-muted-foreground">
              {filteredEntries.length} of {phonebookEntries.length} entries
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading phonebook entries...</div>
          ) : filteredEntries.length > 0 ? (
            <div className="space-y-1">
              {filteredEntries.map((entry: any) => (
                <PhonebookEntry key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {phonebookEntries.length === 0
                ? "No contacts in your phonebook yet. Add your first contact to get started."
                : "No contacts found matching your search criteria"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
