"use client"

import type React from "react"

import { ImageUp, LoaderCircle } from "lucide-react"
import { useRef, useState } from "react"

type ProductImageFieldProps = {
  name: string
  label: string
  defaultValue?: string
  multiple?: boolean
  rows?: number
  placeholder: string
  required?: boolean
}

export function ProductImageField({
  name,
  label,
  defaultValue = "",
  multiple = false,
  rows = 3,
  placeholder,
  required = true,
}: ProductImageFieldProps) {
  const [value, setValue] = useState(defaultValue)
  const [error, setError] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) {
      return
    }

    setError("")
    setIsUploading(true)

    try {
      const uploadedUrls: string[] = []

      for (const file of files) {
        const payload = new FormData()
        payload.append("file", file)

        const response = await fetch("/api/admin/uploads/product-image", {
          method: "POST",
          body: payload,
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error ?? "Could not upload the image.")
        }

        uploadedUrls.push(data.url)
      }

      setValue((current) => {
        if (!multiple) {
          return uploadedUrls[0] ?? current
        }

        return [...current.split(/\r?\n/).map((item) => item.trim()).filter(Boolean), ...uploadedUrls]
          .filter((item, index, array) => array.indexOf(item) === index)
          .join("\n")
      })
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Could not upload the image.")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label className="text-sm font-semibold text-foreground">{label}</label>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground transition hover:border-primary/35 hover:text-primary">
          {isUploading ? <LoaderCircle className="size-4 animate-spin" /> : <ImageUp className="size-4" />}
          Upload from device
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple={multiple}
            className="hidden"
            onChange={handleFiles}
          />
        </label>
      </div>

      {multiple ? (
        <textarea
          name={name}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
          required={required}
        />
      ) : (
        <input
          name={name}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
          required={required}
        />
      )}

      <p className="text-xs text-muted-foreground">
        {multiple
          ? "Optional gallery: paste image URLs one per line or upload extra JPG, PNG, or WEBP files from this device."
          : "Use one option only: paste a public image URL or upload a JPG, PNG, or WEBP file from this device. Uploading fills this field automatically."}
      </p>
      {error ? <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
