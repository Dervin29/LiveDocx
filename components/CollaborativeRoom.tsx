"use client"

import { ClientSideSuspense, RoomProvider } from '@liveblocks/react/suspense'
import { Editor } from "@/components/editor/Editor";
import Header from "@/components/Header";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import React, { use, useEffect, useRef, useState } from 'react'
import ActiveCollaborators from './ActiveCollaborators';
import { Input } from './ui/input';
import Image from 'next/image';
import { updateDocument } from '@/lib/actions/room.actions';
import Loader from './Loader';
import ShareModal from './ShareModal';

const CollaborativeRoom = ({roomId, roomMetadata, users, currentUserType}: CollaborativeRoomProps) => {


  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [documentTitle, setDocumentTitle] = useState(roomMetadata.title);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateTitleHandler = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setLoading(true);

      try {
        if(documentTitle !== roomMetadata.title){
          const updatedDocument = await updateDocument(roomId, documentTitle);

          if (updatedDocument) {
            setEditing(false);
          }
        }
      } catch (error) {
        console.log("error", error);
        
      }

      setLoading(false);
  }
}

  // handle click outside of input
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setEditing(false);
        updateDocument(roomId, documentTitle);
      }

     

    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [roomId, documentTitle]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);


  return (
    <RoomProvider id={roomId}>
    <ClientSideSuspense fallback={<Loader />}>
    <Header>
        <div ref={containerRef} className=" flex w-fit items-center justify-center gap-2">
          {editing && !loading ? (
            <Input
            type='text'
              ref={inputRef}
              className=" document-title-input"
              value={documentTitle}
              placeholder='enter title'
              onChange={(e) => setDocumentTitle(e.target.value)}
              onKeyDown={updateTitleHandler}
              disabled = {!editing}

            />
          ) : (
            <>
              <p className=" document-title">{documentTitle}</p>
            </>
          )}

          {currentUserType === 'editor' && !editing && (
            <Image
              src="/assets/icons/edit.svg"
              width={20}
              height={20}
              alt="edit"
              onClick={() => setEditing(true)}
              className='cursor-pointer'
            />
          )}
          
          {currentUserType !== 'editor' && !editing &&(
            <p className='view-only-tag'>View Only</p>
          )}

          {loading && <p className='text-sm text-gray-400'>saving...</p>}


        </div>
        <div className=' flex w-full flex-1 justify-end gap-2 sm:gap-4'>
          <ActiveCollaborators/>

          <ShareModal 
          roomId={roomId}
          collaborators = {users}
          creatorId = {roomMetadata.creatorId}
          currentUserType={currentUserType}
          />

          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </Header>
      <Editor roomId ={roomId} currentUserType={currentUserType}/>
    </ClientSideSuspense>
  </RoomProvider>
  )
}

export default CollaborativeRoom