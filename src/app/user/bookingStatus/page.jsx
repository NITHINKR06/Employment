'use client';

import React from 'react';
import BookingStatus from '@/components/BookingStatus/BookingStatus';
import Search, { SBox } from '@/components/SearchBox/Search';

export default function BookingStatu() {

  return (
    <div className='mt-10 items-center justify-center'>
      <Search/>
      <div className=" flex items-center justify-center p-4">
        <BookingStatus/>
      </div>
    </div>
  );
}
