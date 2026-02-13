package com.reserve.admin.repository;

import com.reserve.admin.model.Reserve;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReserveRepository extends JpaRepository<Reserve,Long> {


}
