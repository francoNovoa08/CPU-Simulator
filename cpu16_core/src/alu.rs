//! Arithmetic Logic Unit (ALU) implementation

/// Output value and zero flag
pub struct AluResult {
    pub value: u16,
    pub flag_z:bool,
}

impl AluResult {
    fn new(value: u16) -> Self {
        Self { value, flag_z: value == 0}
    }
}

pub fn add(a: u16, b: u16) -> AluResult {
    AluResult::new(a.wrapping_add(b))
}

pub fn sub(a: u16, b: u16) -> AluResult {
    AluResult::new(a.wrapping_sub(b))
}

pub fn and(a: u16, b: u16) -> AluResult {
    AluResult::new(a & b)
}

pub fn or(a: u16, b: u16) -> AluResult {
    AluResult::new(a | b)
}

pub fn not(a: u16) -> AluResult {
    AluResult::new(!a)
}

#[cfg(test)]
mod tests {
    use super::*;

    // add tests
    #[test]
    fn add_10_25() {
        let r = add(10, 25);
        assert_eq!(r.value, 35);
        assert!(!r.flag_z);
    }

    #[test]
    fn add_result_is_zero_sets_flag() {
        let r = add(0, 0);
        assert_eq!(r.value, 0);
        assert!(r.flag_z);
    }

    #[test]
    fn add_wraps_on_overflow() {
        let r = add(0xFFFF, 1);
        assert_eq!(r.value, 0x0000);
        assert!(r.flag_z, "overflow to zero must set the Z flag");
    }

    #[test]
    fn add_overflow_nonzero_no_flag() {
        let r = add(0xFFFF, 2);
        assert_eq!(r.value, 0x0001);
        assert!(!r.flag_z);
    }


    // sub tests
    #[test]
    fn sub_100_67() {
        let r = sub(100, 67);
        assert_eq!(r.value, 33);
        assert!(!r.flag_z);
    }

    #[test]
    fn sub_result_is_zero_sets_flag() {
        let r = sub(5, 5);
        assert_eq!(r.value, 0);
        assert!(r.flag_z);
    }

    #[test]
    fn sub_wraps_on_underflow() {
        // 0 - 1 wraps to 0xFFFF
        let r = sub(0, 1);
        assert_eq!(r.value, 0xFFFF);
        assert!(!r.flag_z);
    }

    #[test]
    fn sub_countdown_final_step() {
        let r = sub(1, 1);
        assert!(r.flag_z);
    }

    // and tests
    #[test]
    fn and_basic() {
        let r = and(0b1100, 0b1010);
        assert_eq!(r.value, 0b1000);
        assert!(!r.flag_z);
    }

    #[test]
    fn and_produces_zero_sets_flag() {
        let r = and(0xFF00, 0x00FF);
        assert_eq!(r.value, 0);
        assert!(r.flag_z);
    }

    #[test]
    fn and_identity_with_all_ones() {
        let r = and(0xABCD, 0xFFFF);
        assert_eq!(r.value, 0xABCD);
    }

    // or tests
    #[test]
    fn or_basic() {
        let r = or(0b1100, 0b0011);
        assert_eq!(r.value, 0b1111);
        assert!(!r.flag_z);
    }

    #[test]
    fn or_zero_with_zero_sets_flag() {
        let r = or(0, 0);
        assert!(r.flag_z);
    }

    #[test]
    fn or_idempotent() {
        let r = or(0xBEEF, 0xBEEF);
        assert_eq!(r.value, 0xBEEF);
    }

    // not tests
    #[test]
    fn not_flips_all_bits() {
        let r = not(0x0000);
        assert_eq!(r.value, 0xFFFF);
        assert!(!r.flag_z);
    }

    #[test]
    fn not_all_ones_gives_zero_sets_flag() {
        let r = not(0xFFFF);
        assert_eq!(r.value, 0x0000);
        assert!(r.flag_z);
    }

    #[test]
    fn not_applying_twice_reverts_to_original() {
        let x = 0x1234u16;
        assert_eq!(not(not(x).value).value, x);
    }

    #[test]
    fn not_zero_gives_all_ones() {
        let r = not(0);
        assert_eq!(r.value, 0xFFFF);
    }
}