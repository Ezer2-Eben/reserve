package com.reserve.admin.service;

import com.reserve.admin.model.Reserve;

import java.util.List;
import java.util.Optional;

public interface ReserveService {

    List<Reserve> getAllReserves();
    Optional<Reserve>getReserveById(Long id);
    Reserve createReserve(Reserve reserve);
    Reserve updateReserve(Long id , Reserve reserve);
    void deleteReserve(Long id);

}
