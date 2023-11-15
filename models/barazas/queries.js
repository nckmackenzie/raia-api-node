exports.getChat = () => {
  const sql = `
    SELECT 
    c.id,
	c.message,
	c.message_url,
	c.is_deleted,
	c.created_at,
    ('{"id": "' || u.id || '", "full_name": "' || u.full_name || '", "username": "' || u.username || '", "profile_image": "' || u.profile_image || '"}')::JSON AS user
 FROM discussion_chats c join users u on c.user_id = u.id 
 WHERE c.id = ?    
    `;
  return sql;
};
