import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Calculate the cutoff date (2 days ago)
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    const cutoffDate = twoDaysAgo.toISOString()
    
    console.log(`[Cleanup] Starting cleanup for orders older than: ${cutoffDate}`)
    
    // First, get the orders that will be deleted for logging
    const { data: ordersToDelete, error: fetchError } = await supabase
      .from('orders')
      .select('id, order_number, status, created_at')
      .lt('created_at', cutoffDate)
    
    if (fetchError) {
      console.error('[Cleanup] Error fetching orders to delete:', fetchError)
      throw fetchError
    }
    
    console.log(`[Cleanup] Found ${ordersToDelete?.length || 0} orders to delete`)
    
    if (ordersToDelete && ordersToDelete.length > 0) {
      // Log each order being deleted
      ordersToDelete.forEach(order => {
        console.log(`[Cleanup] Deleting order: ${order.order_number} (Status: ${order.status}, Created: ${order.created_at})`)
      })
      
      // Delete the orders
      const { error: deleteError, count } = await supabase
        .from('orders')
        .delete()
        .lt('created_at', cutoffDate)
      
      if (deleteError) {
        console.error('[Cleanup] Error deleting orders:', deleteError)
        throw deleteError
      }
      
      console.log(`[Cleanup] Successfully deleted ${count || ordersToDelete.length} orders`)
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Successfully deleted ${ordersToDelete.length} orders older than 2 days`,
          deletedOrders: ordersToDelete.map(o => o.order_number),
          cutoffDate: cutoffDate
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }
    
    console.log('[Cleanup] No orders to delete')
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'No orders older than 2 days found',
        deletedOrders: [],
        cutoffDate: cutoffDate
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Cleanup] Cleanup failed:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})