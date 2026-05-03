//! Memory - 65536 address bytes with MMIO at 0xFFFF, each address holds one u16
//! 
//! MMIO: Memory-Mapped I/O, memory address mapped to peripheral registers

pub const SIZE: usize = 65_536;
pub const MMIO_ADDR: u16 = 0xFFFF;

pub struct Memory {
    words: Box<[u16; SIZE]>,
}

impl Memory {
    pub fn new() -> Self {
        Self { words: Box::new([0u16; SIZE]), }
    }

    /// Read word at `addr`.
    pub fn read(&self, addr: u16) -> u16 {
        self.words[addr as usize]
    }

    /// Write `value` to `addr`. 
    /// 
    /// Returns `Some(value)` if `addr` is MMIO, `None` otherwise.
    pub fn write(&mut self, addr: u16, value: u16) -> Option<u16> {
        self.words[addr as usize] = value;
        if addr == MMIO_ADDR {
            Some(value)
        } else {
            None
        }
    }

    /// Load a slice of words into memory starting at address 0
    /// 
    /// # Panics
    /// 
    /// Panics if the program size exceeds memory capacity
    pub fn load(&mut self, words: &[u16]) {
        assert!(
            words.len() <= SIZE,
            "Program size exceeds memory capacity ({} words)",
            words.len()
        );
        self.words[..words.len()].copy_from_slice(words);
    }

    /// Reset memory to all zeros
    pub fn reset(&mut self) {
        self.words.fill(0);
    }
}

impl Default for Memory {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn fresh_memory_reads_zero_everywhere() {
        let mem = Memory::new();
        assert_eq!(mem.read(0x0000), 0);
        assert_eq!(mem.read(0x0001), 0);
        assert_eq!(mem.read(0xFFFE), 0);
        assert_eq!(mem.read(0xFFFF), 0);
    }

    #[test]
    fn write_and_read_back() {
        let mut mem = Memory::new();
        mem.write(0x0010, 0xABCD);
        assert_eq!(mem.read(0x0010), 0xABCD);
    }

    #[test]
    fn write_does_not_bleed_into_adjacent_addresses() {
        let mut mem = Memory::new();
        mem.write(0x0010, 0x1234);
        assert_eq!(mem.read(0x000F), 0);
        assert_eq!(mem.read(0x0011), 0);
    }

    #[test]
    fn write_returns_none_for_ordinary_address() {
        let mut mem = Memory::new();
        let result = mem.write(0x0042, 0xFF);
        assert_eq!(result, None);
    }

    #[test]
    fn write_to_mmio_returns_some_value() {
        let mut mem = Memory::new();
        let result = mem.write(MMIO_ADDR, 1);
        assert_eq!(result, Some(1));
    }

    #[test]
    fn write_zero_to_mmio_returns_some_zero() {
        let mut mem = Memory::new();
        let result = mem.write(MMIO_ADDR, 0);
        assert_eq!(result, Some(0));
    }

    #[test]
    fn write_to_mmio_is_readable() {
        let mut mem = Memory::new();
        mem.write(MMIO_ADDR, 0xBEEF);
        assert_eq!(mem.read(MMIO_ADDR), 0xBEEF);
    }

    #[test]
    fn load_places_words_from_address_zero() {
        let mut mem = Memory::new();
        mem.load(&[0x0001, 0x0002, 0x0003]);
        assert_eq!(mem.read(0), 0x0001);
        assert_eq!(mem.read(1), 0x0002);
        assert_eq!(mem.read(2), 0x0003);
    }

    #[test]
    fn load_does_not_touch_words_beyond_program() {
        let mut mem = Memory::new();
        mem.write(0x0005, 0xDEAD);
        mem.load(&[0x1111, 0x2222]);
        assert_eq!(mem.read(0x0005), 0xDEAD);
    }

    #[test]
    fn load_empty_slice_is_a_noop() {
        let mut mem = Memory::new();
        mem.load(&[]);
        assert_eq!(mem.read(0), 0);
    }

    #[test]
    fn reset_clears_all_memory() {
        let mut mem = Memory::new();
        mem.write(0x0000, 0x1234);
        mem.write(0x8000, 0xABCD);
        mem.write(MMIO_ADDR, 0x0001);
        mem.reset();
        assert_eq!(mem.read(0x0000), 0);
        assert_eq!(mem.read(0x8000), 0);
        assert_eq!(mem.read(MMIO_ADDR), 0);
    }
}