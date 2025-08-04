import ModalContainer from './ModalContainer'
import { IoClose } from 'react-icons/io5'
import type { PostUser } from '../pages/UserPage';
import { Link } from 'react-router-dom';

interface countModalProps {
    onClose: () => void;
    showModal: boolean;
    modalType: string | null;
    postuser: PostUser | null;
}

function CountModal({ onClose, showModal, modalType, postuser }: countModalProps) {
    return <>
        {showModal && modalType && (
            <ModalContainer onClose={onClose} open_status={showModal}>
                <div className="p-4 max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                            {modalType === "followers" ? `Followers (${postuser?.follower_count})` : `Following (${postuser?.following_count})`}
                        </h2>
                        <IoClose
                            className="text-2xl text-gray-600 hover:text-gray-900 dark:text-gray-300 cursor-pointer"
                            onClick={onClose}
                        />
                    </div>
                    <div className="max-h-[300px] overflow-y-auto space-y-3">
                        {(modalType === "followers" ? postuser?.followers : postuser?.followings)?.map((f: any, idx: number) => {
                            const user = modalType === "followers" ? f.user_id : f.follow_id;
                            return (<Link to={`/user/${user.username}`} key={idx} className="flex items-center gap-4 hover:opacity-70 cursor-pointer">
                                <div
                                    className="w-10 h-10 bg-cover bg-center rounded-full"
                                    style={{ backgroundImage: `url(${user.profile_pic || '/profile-default.webp'})` }}
                                />
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                                </div>
                            </Link>)
                        })}

                        {((modalType === "followers" ? postuser?.followers : postuser?.followings)?.length === 0) && (
                            <p className="text-center text-gray-500">No {modalType}</p>
                        )}
                    </div>
                </div>
            </ModalContainer>
        )}
    </>
}

export default CountModal