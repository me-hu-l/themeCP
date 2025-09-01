import React from 'react'

const P = () => {
  return (
    <div className='p-4 bg-white text-black display flex flex-col bold size-full fontsize-[30px]'>
      <ul>
        <li>
            We use google log in to sign in user.
        </li>
        <li>
            We only use your data to create a user session for our webpage and not for anyother purposes.
        </li>
        <li>
            By logging in through google you aggree to share you personal data.
        </li>
      </ul>
    </div>
  )
}

export default P