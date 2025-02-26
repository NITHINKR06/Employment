'use client';

import React from 'react';
import BookingStatus from '@/components/BookingStatus/BookingStatus';
import Search from '@/components/SearchBox/Search';

export default function BookingStatu() {

  return (
    <div className='mt-14'>
      {/* <Search/> */}
      <div className=" flex items-center justify-center p-4">
        <BookingStatus/>
      </div>
    </div>
  );
}
