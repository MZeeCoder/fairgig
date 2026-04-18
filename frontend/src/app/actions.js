'use server'

import { cookies } from 'next/headers'

export async function deleteAuthCookies() {
  const cookieStore = await cookies()
  cookieStore.delete('refreshToken')
  cookieStore.delete('userRole')
  // Add any other cookies you want to wipe here
}
