"""
Pydantic Schemas for ADHD Daily Routines (Dedicated Routine Data & Telemetry)
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class RoutineStepModel(BaseModel):
    step_id: int = Field(..., description="Thứ tự vi bước")
    badge: str = Field(..., description="Tên huy hiệu vi bước")
    action_verb: Optional[str] = Field(None, description="Động từ hành động thể chất")
    atomic_instruction: str = Field(..., description="Câu lệnh hành động đơn lẻ < 15 từ")
    ui_type: str = Field(
        ...,
        description="Loại tương tác: single_choice, checkbox, highlight, text_input, photo_proof",
    )
    is_milestone: bool = Field(
        False, description="Đánh dấu bước then chốt có bằng chứng thị giác"
    )
    requires_parent_check: bool = Field(
        False, description="Có bắt buộc phụ huynh duyệt tại chỗ hay không"
    )
    duration_sec: int = Field(45, description="Thời gian đếm ngược nhịp độ (giây)")
    dopamine_points: int = Field(10, description="Số điểm sao thưởng vi mô tức thì")
    hints: List[str] = Field(default_factory=list, description="Danh sách gợi ý của Milo")


class DailyRoutineModel(BaseModel):
    id: str = Field(..., description="Mã định danh thói quen (VD: routine_clean_desk)")
    timeline_slot: str = Field(
        ...,
        description="Khung giờ sinh học: morning, afternoon, evening, night",
    )
    slot_time: str = Field(..., description="Mốc thời gian mở khóa (VD: 19:00)")
    title: str = Field(..., description="Tên thói quen sinh hoạt")
    cat: str = Field("routine", description="Danh mục")
    catName: str = Field(..., description="Tên danh mục hiển thị")
    icon: str = Field(..., description="Emoji biểu tượng đảo thói quen")
    island: str = Field("routine", description="Đảo thói quen")
    reward: int = Field(25, description="Tổng điểm sao thưởng")
    target_photo_tag: Optional[str] = Field(
        None, description="Tên thẻ ảnh chụp minh chứng mẫu"
    )
    adhd_scaffolding_notes: Optional[Dict[str, Any]] = Field(
        None, description="Ghi chú giàn giáo nhận thức ADHD"
    )
    steps: List[RoutineStepModel] = Field(
        ..., description="Chuỗi 2-4 vi bước siêu nguyên tử"
    )


class RoutinesListResponse(BaseModel):
    total_routines: int = Field(..., description="Tổng số thói quen")
    timeline_slots: List[str] = Field(..., description="Danh sách các khung giờ")
    routines_by_slot: Dict[str, List[DailyRoutineModel]] = Field(
        ..., description="Thói quen gom nhóm theo khung giờ"
    )
    routines: List[DailyRoutineModel] = Field(..., description="Danh sách phẳng")


class RoutineProofSubmitRequest(BaseModel):
    routine_id: str = Field(..., description="Mã routine vừa hoàn thành")
    kid_id: str = Field("kid_milo_01", description="Mã bé")
    photo_tag: Optional[str] = Field(None, description="Tên ảnh minh chứng")
    timestamp: Optional[str] = Field(None, description="Thời gian hoàn thành")


class RoutineHeartCheerRequest(BaseModel):
    routine_id: str = Field(..., description="Mã routine phụ huynh thả tim")
    parent_id: str = Field("me_lan", description="Mã phụ huynh")
    praise_message: str = Field(
        "Mẹ rất tự hào vì con tự giác dọn dẹp!", description="Lời nhắn khích lệ"
    )
    bonus_stars: int = Field(5, description="Sao thưởng thêm")
