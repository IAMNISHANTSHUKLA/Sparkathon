import { createClient } from "@supabase/supabase-js"

// Environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

// Create a single supabase client for the browser
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: "public",
  },
  global: {
    headers: {
      "X-Client-Info": "opspilot-frontend@1.0.0",
      "X-Team": "crazsymb",
      "X-Hackathon": "Walmart Sparkathon",
    },
  },
})

// For server-side operations (API routes, server components)
export const createServerClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase server environment variables")
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: "public",
    },
    global: {
      headers: {
        "X-Client-Info": "opspilot-backend@1.0.0",
        "X-Team": "crazsymb",
        "X-Hackathon": "Walmart Sparkathon",
      },
    },
  })
}

// Database types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      vendors: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          country: string | null
          score: number
          on_time_delivery_rate: number
          quality_score: number
          response_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          country?: string | null
          score?: number
          on_time_delivery_rate?: number
          quality_score?: number
          response_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          country?: string | null
          score?: number
          on_time_delivery_rate?: number
          quality_score?: number
          response_time?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      shipments: {
        Row: {
          id: string
          shipment_id: string
          vendor_id: string | null
          origin: string
          destination: string
          carrier: string | null
          status: "pending" | "in-transit" | "delivered" | "delayed" | "customs"
          eta: string | null
          actual_delivery: string | null
          value: number | null
          currency: string
          tracking_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shipment_id: string
          vendor_id?: string | null
          origin: string
          destination: string
          carrier?: string | null
          status?: "pending" | "in-transit" | "delivered" | "delayed" | "customs"
          eta?: string | null
          actual_delivery?: string | null
          value?: number | null
          currency?: string
          tracking_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shipment_id?: string
          vendor_id?: string | null
          origin?: string
          destination?: string
          carrier?: string | null
          status?: "pending" | "in-transit" | "delivered" | "delayed" | "customs"
          eta?: string | null
          actual_delivery?: string | null
          value?: number | null
          currency?: string
          tracking_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          vendor_id: string | null
          po_number: string | null
          grn_number: string | null
          status: "pending" | "approved" | "rejected" | "paid"
          amount: number
          currency: string
          issue_date: string | null
          due_date: string | null
          payment_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_number: string
          vendor_id?: string | null
          po_number?: string | null
          grn_number?: string | null
          status?: "pending" | "approved" | "rejected" | "paid"
          amount: number
          currency?: string
          issue_date?: string | null
          due_date?: string | null
          payment_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_number?: string
          vendor_id?: string | null
          po_number?: string | null
          grn_number?: string | null
          status?: "pending" | "approved" | "rejected" | "paid"
          amount?: number
          currency?: string
          issue_date?: string | null
          due_date?: string | null
          payment_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      csv_uploads: {
        Row: {
          id: string
          filename: string
          original_name: string
          data_type: string
          file_size: number | null
          records_processed: number
          records_failed: number
          status: "processing" | "completed" | "failed"
          error_details: any | null
          uploaded_by: string | null
          supabase_path: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          filename: string
          original_name: string
          data_type: string
          file_size?: number | null
          records_processed?: number
          records_failed?: number
          status?: "processing" | "completed" | "failed"
          error_details?: any | null
          uploaded_by?: string | null
          supabase_path?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          filename?: string
          original_name?: string
          data_type?: string
          file_size?: number | null
          records_processed?: number
          records_failed?: number
          status?: "processing" | "completed" | "failed"
          error_details?: any | null
          uploaded_by?: string | null
          supabase_path?: string | null
          created_at?: string
          completed_at?: string | null
        }
      }
    }
    Views: {
      dashboard_kpis: {
        Row: {
          total_shipments: number | null
          avg_vendor_score: number | null
          invoice_accuracy: number | null
          monthly_agent_actions: number | null
          monthly_spend: number | null
          avg_on_time_delivery: number | null
          high_risk_alerts: number | null
          avg_esg_score: number | null
        }
      }
    }
    Functions: {
      generate_sample_csv_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          data_type: string
          sample_data: any
        }[]
      }
    }
  }
}

// Helper functions for common operations
export const supabaseHelpers = {
  // Test connection
  async testConnection() {
    try {
      const { data, error } = await supabase.from("vendors").select("count").limit(1)
      if (error) throw error
      return { success: true, message: "Connection successful" }
    } catch (error) {
      return { success: false, message: error.message }
    }
  },

  // Get dashboard KPIs
  async getDashboardKPIs() {
    const { data, error } = await supabase.from("dashboard_kpis").select("*").single()
    if (error) throw error
    return data
  },

  // Upload CSV file to storage
  async uploadCSVFile(file: File, dataType: string) {
    const fileName = `${dataType}/${Date.now()}-${file.name}`

    const { data: uploadData, error: uploadError } = await supabase.storage.from("csv-uploads").upload(fileName, file)

    if (uploadError) throw uploadError

    // Record the upload in the database
    const { data: recordData, error: recordError } = await supabase
      .from("csv_uploads")
      .insert({
        filename: fileName,
        original_name: file.name,
        data_type: dataType,
        file_size: file.size,
        supabase_path: uploadData.path,
        status: "processing",
      })
      .select()
      .single()

    if (recordError) throw recordError

    return { uploadData, recordData }
  },

  // Get CSV upload status
  async getCSVUploadStatus(uploadId: string) {
    const { data, error } = await supabase.from("csv_uploads").select("*").eq("id", uploadId).single()

    if (error) throw error
    return data
  },

  // Update CSV upload status
  async updateCSVUploadStatus(
    uploadId: string,
    status: "processing" | "completed" | "failed",
    processed = 0,
    failed = 0,
    errorDetails?: any,
  ) {
    const updateData: any = {
      status,
      records_processed: processed,
      records_failed: failed,
    }

    if (status === "completed" || status === "failed") {
      updateData.completed_at = new Date().toISOString()
    }

    if (errorDetails) {
      updateData.error_details = errorDetails
    }

    const { data, error } = await supabase.from("csv_uploads").update(updateData).eq("id", uploadId).select().single()

    if (error) throw error
    return data
  },

  // Bulk insert data
  async bulkInsert(table: string, data: any[]) {
    const { data: result, error } = await supabase.from(table).insert(data).select()

    if (error) throw error
    return result
  },

  // Get recent notifications
  async getNotifications(limit = 10) {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },

  // Mark notification as read
  async markNotificationRead(notificationId: string) {
    const { data, error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

// Real-time subscriptions
export const subscribeToTable = (table: string, callback: (payload: any) => void, filter?: string) => {
  const subscription = supabase
    .channel(`${table}-changes`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table,
        filter,
      },
      callback,
    )
    .subscribe()

  return subscription
}

// Export types for use in components
export type Vendor = Database["public"]["Tables"]["vendors"]["Row"]
export type Shipment = Database["public"]["Tables"]["shipments"]["Row"]
export type Invoice = Database["public"]["Tables"]["invoices"]["Row"]
export type CSVUpload = Database["public"]["Tables"]["csv_uploads"]["Row"]
export type DashboardKPIs = Database["public"]["Views"]["dashboard_kpis"]["Row"]
