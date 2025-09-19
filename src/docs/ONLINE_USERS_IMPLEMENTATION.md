# Real-Time Online Users Implementation

## Overview
This implementation provides a complete real-time online users system for the Edu Share React application using Supabase. It includes automatic user presence tracking, heartbeat mechanisms, and real-time updates across all connected clients.

## Features

### ✅ Core Functionality
- **Real-time Online Detection**: Users are marked online when they open the app
- **Automatic Offline Detection**: Users go offline when they close the app or become inactive
- **Heartbeat System**: Updates user activity every 10 seconds to maintain online status
- **Smart Filtering**: Only shows users active within the last 30 seconds
- **Real-time Updates**: All clients see online/offline changes instantly
- **Automatic Cleanup**: Removes inactive users from the database automatically

### ✅ Technical Features
- **Custom React Hook**: `useOnlineUsers` for easy integration
- **Supabase Realtime**: PostgreSQL change subscriptions for instant updates
- **Error Handling**: Comprehensive error handling and logging
- **Performance Optimized**: Efficient filtering and cleanup mechanisms
- **Memory Management**: Proper cleanup of intervals and subscriptions

## Implementation

### 1. Custom Hook: `useOnlineUsers.js`

```javascript
import { useOnlineUsers } from '../hooks/useOnlineUsers'

const { onlineUsers, isConnected, refreshOnlineUsers } = useOnlineUsers(user?.id)
```

**Returns:**
- `onlineUsers`: Array of currently online users
- `isConnected`: Boolean indicating real-time connection status
- `refreshOnlineUsers`: Function to manually refresh the online users list

### 2. Database Schema

The system uses the `online_users` table with the following structure:

```sql
CREATE TABLE online_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Real-time Subscription

The hook automatically subscribes to PostgreSQL changes on the `online_users` table:

- **INSERT**: Adds new users to the online list
- **UPDATE**: Updates user information and last_seen timestamp
- **DELETE**: Removes users from the online list

### 4. Heartbeat Mechanism

- Updates `last_seen` timestamp every 10 seconds
- Keeps users online as long as they're active
- Automatically removes users inactive for 30+ seconds

### 5. Automatic Cleanup

- Runs every 30 seconds to remove inactive users
- Prevents database bloat from abandoned sessions
- Maintains accurate online user counts

## Usage Examples

### Basic Usage in Chat Component

```javascript
import { useOnlineUsers } from '../hooks/useOnlineUsers'

const Chat = () => {
  const { user } = useAuth()
  const { onlineUsers, isConnected, refreshOnlineUsers } = useOnlineUsers(user?.id)

  return (
    <div>
      <h3>Online Users ({onlineUsers.length})</h3>
      {onlineUsers.map(user => (
        <div key={user.id}>
          {user.full_name} - {isConnected ? '🟢' : '🟡'}
        </div>
      ))}
    </div>
  )
}
```

### Advanced Usage with Manual Refresh

```javascript
const UsersPage = () => {
  const { onlineUsers, refreshOnlineUsers } = useOnlineUsers(user?.id)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshOnlineUsers()
    setIsRefreshing(false)
  }

  return (
    <div>
      <button onClick={handleRefresh} disabled={isRefreshing}>
        {isRefreshing ? 'Refreshing...' : 'Refresh Users'}
      </button>
      {/* User list */}
    </div>
  )
}
```

## Configuration

### Timeout Settings

The system uses configurable timeouts that can be adjusted in the hook:

```javascript
// Heartbeat interval (default: 10 seconds)
heartbeatIntervalRef.current = setInterval(updateHeartbeat, 10000)

// Cleanup interval (default: 30 seconds)
cleanupIntervalRef.current = setInterval(cleanupInactiveUsers, 30000)

// Online threshold (default: 30 seconds)
const diffInSeconds = (now - lastSeen) / 1000
return diffInSeconds <= 30
```

### Customization Options

You can modify the hook to adjust:

- **Heartbeat Frequency**: How often to update user activity
- **Online Threshold**: How long users stay online after last activity
- **Cleanup Frequency**: How often to remove inactive users
- **Database Table**: Which table to use for online users

## Error Handling

The implementation includes comprehensive error handling:

- **Database Errors**: Logged and handled gracefully
- **Network Issues**: Automatic retry mechanisms
- **Subscription Failures**: Fallback to polling
- **User Authentication**: Proper cleanup on logout

## Performance Considerations

### Optimizations
- **Efficient Filtering**: Only processes users within the active threshold
- **Minimal Database Queries**: Batched operations and smart caching
- **Memory Management**: Proper cleanup of intervals and subscriptions
- **Real-time Efficiency**: Uses Supabase's optimized change streams

### Monitoring
- **Console Logging**: Detailed logs for debugging
- **Connection Status**: Real-time connection monitoring
- **User Counts**: Tracks active vs total users

## Security

### Data Protection
- **User Privacy**: Only shows necessary user information
- **Authentication**: Requires valid user session
- **Authorization**: Users can only see their own online status

### Database Security
- **Row Level Security**: Implement RLS policies as needed
- **Data Cleanup**: Automatic removal of stale data
- **Input Validation**: Proper data sanitization

## Troubleshooting

### Common Issues

1. **Users not appearing online**
   - Check Supabase realtime connection
   - Verify database permissions
   - Check console for errors

2. **Users staying online too long**
   - Adjust cleanup interval
   - Check heartbeat mechanism
   - Verify timezone settings

3. **Real-time not working**
   - Check Supabase project settings
   - Verify realtime is enabled
   - Check network connectivity

### Debug Information

The hook provides detailed console logging:

```javascript
console.log('User added to online list')
console.log('Loaded 5 online users out of 10 total')
console.log('Online users subscription status: SUBSCRIBED')
```

## Future Enhancements

### Potential Improvements
- **User Status**: Away, busy, do not disturb
- **Last Activity**: More detailed activity tracking
- **User Groups**: Online users by department/role
- **Push Notifications**: Notify when users come online
- **Analytics**: User activity metrics and insights

### Scalability
- **Pagination**: For large user bases
- **Caching**: Redis for high-traffic applications
- **Load Balancing**: Multiple Supabase instances
- **CDN**: Global presence tracking

## Conclusion

This implementation provides a robust, scalable, and user-friendly real-time online users system that integrates seamlessly with the Edu Share React application. It handles all edge cases, provides excellent performance, and maintains data accuracy through intelligent cleanup mechanisms.

The modular design makes it easy to extend and customize for specific requirements while maintaining clean, maintainable code.
