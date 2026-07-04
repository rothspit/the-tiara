'use server'

export async function postReview(_formData: FormData) {
  return { error: '口コミ投稿は現在準備中です。' }
}

export async function updateDiary(_id: string, _formData: FormData) {
  return { error: '写メ日記は CRM で管理しています。' }
}
