import { useEffect, useState } from 'react';
import { api } from '../api';
import { Button, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import type { User } from './pack/User';

type Props = {
  userId: string;
  type: 'followers' | 'following';
  onClose: () => void;
};

const FollowList = ({ userId, type, onClose }: Props) => {
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/users/${userId}/${type}`).then((res) => setUsers(res.data));
  }, [userId, type]);

  return (
    <div className="follow-modal" onClick={onClose}>
      <div className="follow-modal-inner" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text fontWeight="bold">
            {type === 'followers' ? 'Followers' : 'Following'}
          </Text>
          <Button size="xs" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div style={{ marginTop: '1rem' }}>
          {users.length === 0 && <p className="empty">Nobody here yet</p>}
          {users.map((u) => (
            <div
              key={u.id}
              className="follow-item"
              onClick={() => {
                navigate(`/user/${u.id}`);
                onClose();
              }}
            >
              <Text fontWeight="bold" style={{ cursor: 'pointer' }}>
                {u.username}
              </Text>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FollowList;
